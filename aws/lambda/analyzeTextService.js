const aws = require("aws-sdk");
const _ = require('lodash/collection');
const tableName = process.env.TABLE_NAME || 'Messages';
const ddb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

const handler = async (event, context) => {
    let record = event.Records[0];
    console.log(record);
    let file = '';
    try {
        let body = JSON.parse(record.body);
        console.log(`body:${body}`);
        let Message = body.Message;
        console.log(`Message:${Message}`)
        let parsedMessage = JSON.parse(Message);
        console.log(parsedMessage.JobId);
        let textract = new aws.Textract();
        file = parsedMessage.DocumentLocation.S3ObjectName
        let textractResult = await textract.getDocumentAnalysis({
            JobId: parsedMessage.JobId
        }).promise();
        console.log(`Job with ID:${parsedMessage.JobId} returned with status ${textractResult.JobStatus}
                 Found ${ textractResult.Blocks.length} `);
        let sender = processBlocks(textractResult.Blocks, "Sender");
        let shipper = processBlocks(textractResult.Blocks, "Consignee");
        await saveResult(file, sender, shipper);
    } catch (error) {
        saveError(file);
        console.error(error);
    }

}

const saveResult = async (filename, sender, shipper) => {
    let saveResultSender = sender ? sender.map(x => { return { "S": x } }) : [];
    let saveResultShipper = shipper ? shipper.map(x => { return { "S": x } }) : [];
    let param = {
        TableName: tableName,
        Item: {
            'id': {
                S: filename
            },
            'sender': {
                L: saveResultSender
            },
            'consignee': {
                L: saveResultShipper
            },
            'status': {
                S: 'COMPLETED'
            }
        }
    }
    await ddb.putItem(param).promise();
}

const saveError = async (filename) => {
    let param = {
        TableName: tableName,
        Item: {
            'id': {
                S: filename
            },
            'status': {
                S: 'ERROR'
            }
        }
    }
    await ddb.putItem(param).promise();
}

const processBlocks = (blocks, startWord) => {
    //Find Block with Type WORD and Text Sender
    let sender = _.find(blocks, (val, number) => {
        return val.BlockType === "WORD" && val.Text === startWord;
    });
    if (!sender) {
        return '';
    }
    let keyvalueBlocks = _.filter(blocks, block => { return block.BlockType === "KEY_VALUE_SET" });
    let lines = _.filter(blocks, block => { return block.BlockType === "LINE" });
    let senderKeyValue;
    keyvalueBlocks.forEach(item => {
        if (item.Relationships) {
            if (item.Relationships.find((val, num) => {
                return val.Type === "CHILD" && val.Ids.includes(sender.Id);
            })) {
                senderKeyValue = item;
            }
        }

    });
    if (!senderKeyValue) {
        return '';
    }
    let valueId = senderKeyValue.Relationships.filter(x => x.Type === "VALUE")[0].Ids[0];
    let nextIds = _.find(keyvalueBlocks, (val, num) => { return val.Id === valueId })
        .Relationships.filter(x => x.Type === "CHILD")[0].Ids;
    let lineText = [];
    nextIds.forEach(item => {
        let lineItem = getLineObject(lines, item);
        if (!lineText.includes(lineItem.Text)) {
            lineText.push(lineItem.Text);
        }
    })
    return lineText;
}


const getLineObject = (lines, childId) => {
    let lineObject = _.find(lines, (val, num) => {
        let result = false;
        val.Relationships.forEach(x => {
            if (x.Type === "CHILD" && x.Ids.includes(childId) && !result) {
                result = true;
            }
        })
        return result;
    })
    return lineObject;
}

exports.handler = handler;
