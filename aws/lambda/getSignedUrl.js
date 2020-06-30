const aws = require('aws-sdk');
const bucket = process.env.BUCKET_NAME
const ddb = new aws.DynamoDB({ apiVersion: '2012-08-10' });
const tableName = process.env.TABLE_NAME || 'Messages';

const handler = async (event, context, callback) => {
    let s3 = new aws.S3();
    let fileName = `${makeid(8)}.pdf`;
    try {
        const s3Params = {
            Bucket: bucket,
            Key: fileName,
            ContentType: 'application/pdf',
            ACL: 'bucket-owner-read',
        }
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        }
        let url = s3.getSignedUrl('putObject', s3Params)
        let responseBody = {
            fileName: fileName,
            uploadUrl: url
        };
        let response = {
            "statusCode": 200,
            "body": JSON.stringify(responseBody),
            "isBase64Encoded": false,
            "headers": headers
        };


        
        await saveRequest(fileName);
        callback(null, response);
    } catch (error) {
        callback(error, null);
    }

}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const saveRequest = async (filename) => {
    let param = {
        TableName: tableName,
        Item: {
            'id': {
                S: filename
            },
            'status': {
                S: 'PENDING'
            }
        }
    }
    await ddb.putItem(param).promise();
}

exports.handler = handler;