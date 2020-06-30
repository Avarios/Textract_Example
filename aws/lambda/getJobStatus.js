const aws = require('aws-sdk');
const ddb = new aws.DynamoDB({ apiVersion: '2012-08-10'});
const converter = aws.DynamoDB.Converter;
const tableName = process.env.TABLE_NAME || 'Messages';

exports.handler = async (event, context, callback) => {
    try {
        console.log(event);
        let body = JSON.parse(event.body);
        console.log(body);
        let { fileName } = body;
        var params = {
            TableName: tableName,
            Key: {
                'id': { S: fileName }
            }
        };
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        };
        let result = await ddb.getItem(params).promise();
        let cleanedResult = converter.unmarshall(result.Item);
        const response = {
            "statusCode": 200,
            "body": JSON.stringify(cleanedResult),
            "headers": headers
        };
        callback(null, response);
    }
    catch (error) {
        callback(error, null);
    }
}