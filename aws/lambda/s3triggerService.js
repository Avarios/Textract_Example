const aws = require("aws-sdk");
const uuid = require('uuid');
const snsTopic = process.env.SNS_TOPIC || 'arn:aws:sns:eu-west-1:096573865771:aa';
const roleArn = process.env.TEXTRACT_SNS_ROLE || 'arn:aws:iam::096573865771:role/texttract_sns_role'

const handler = async (event, context) => {
    let textract = new aws.Textract();
    let bucket = event.Records[0].s3.bucket.name;
    let file = event.Records[0].s3.object.key;
    try {
        let params = getTextractParams(bucket,file);
        let result = await textract.startDocumentAnalysis(params).promise();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

const getTextractParams = (bucketName,fileName) => {
    return {
        DocumentLocation: { 
          S3Object: {
            Bucket: bucketName,
            Name: fileName
          }
        },
        FeatureTypes: [ 
          'TABLES',
          'FORMS'
        ],
        ClientRequestToken: uuid.v4(),
        JobTag: 'DocUpload',
        NotificationChannel: {
          RoleArn: roleArn,
          SNSTopicArn: snsTopic
        }
      };
}

exports.handler = handler;