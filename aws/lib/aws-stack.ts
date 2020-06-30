import { Stack, Construct, StackProps, Duration, RemovalPolicy, CfnOutput } from '@aws-cdk/core';
import { Bucket, HttpMethods, EventType } from '@aws-cdk/aws-s3'
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import { ManagedPolicy, Role, ServicePrincipal, PolicyStatement, Anyone, Effect, PolicyDocument } from '@aws-cdk/aws-iam';
import { Topic, TopicPolicy, Subscription, SubscriptionProtocol } from '@aws-cdk/aws-sns';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { S3EventSource, SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Queue, QueuePolicy } from '@aws-cdk/aws-sqs';
import { RestApi, LambdaIntegration, Cors, ApiKey } from '@aws-cdk/aws-apigateway';

export class AwsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'textractStackApi', {
      restApiName: 'Textract Stack API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        statusCode:200
      }
    });
    api.addApiKey('apiKey');
    const bucket = new Bucket(this, 'pocBucket', {
      cors: [
        {
          allowedMethods: [HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*']
        }]
    });
    const snsTextractTopic = new Topic(this, 'textractTopic');
    const textractRole = new Role(this, 'textractRole', {
      assumedBy: new ServicePrincipal('textract.amazonaws.com'),
      managedPolicies: [
        new ManagedPolicy(this, 'textractManaged', {
          managedPolicyName: 'AmazonTextractServiceRole',
          document: new PolicyDocument({
            statements: [new PolicyStatement({
              actions: ['sns:Publish'],
              effect: Effect.ALLOW,
              resources: [
                snsTextractTopic.topicArn
              ]
            })]
          }
          )
        })
      ],
    });
    snsTextractTopic.grantPublish(textractRole);

    const snsPolicy = new TopicPolicy(this, 'textractTopicPolicy', {
      topics: [snsTextractTopic],
    });

    snsPolicy.document.addStatements(this.getSnsPolicyDocument(textractRole.roleArn, snsTextractTopic.topicArn));

    const sqsQueue = new Queue(this, 'textractResultQueue', {
      visibilityTimeout: Duration.minutes(15),
    })

    const queuePolicy = new QueuePolicy(this, 'queuePolicy', {
      queues: [sqsQueue]
    })

    queuePolicy.document.addStatements(this.getQueuePolicyDocument(sqsQueue.queueArn, snsTextractTopic));
    new Subscription(this, 'sqsSubscription', {
      endpoint: sqsQueue.queueArn,
      protocol: SubscriptionProtocol.SQS,
      topic: snsTextractTopic
    });
    const messagesTable = new Table(this, 'messagesTable', {
      partitionKey: {
        name: 'id', type: AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.DESTROY
    });

    const getJobStatusService = new Function(this, 'GetJobStatusService', {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset('lambda'),
      handler: 'getJobStatus.handler',
      memorySize: 128,
      timeout: Duration.minutes(1),
      environment:{
        TABLE_NAME: messagesTable.tableName
      }
    });
    messagesTable.grantReadWriteData(getJobStatusService);
    api.root.addMethod('POST', new LambdaIntegration(getJobStatusService));

    
    const signedUrlService = this.getSignedUrlService(messagesTable.tableName, bucket.bucketName);
    bucket.grantReadWrite(signedUrlService);
    messagesTable.grantReadWriteData(signedUrlService);
    api.root.addMethod('GET', new LambdaIntegration(signedUrlService));

    const analyzeTextService = this.getAnalizeTextService(messagesTable.tableName);
    messagesTable.grantReadWriteData(analyzeTextService);
    new SqsEventSource(sqsQueue).bind(analyzeTextService);

    const s3TriggerService = this.getS3TriggerService(snsTextractTopic.topicArn, textractRole.roleArn);
    new S3EventSource(bucket, {
      events: [EventType.OBJECT_CREATED]
    }).bind(s3TriggerService);
    bucket.grantReadWrite(s3TriggerService);
  }

  getAnalizeTextService = (tableName: string): Function => {
    const analizeTextService = new Function(this, 'AnalyzeTextService', {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset('lambda'),
      handler: 'analyzeTextService.handler',
      memorySize: 128,
      timeout: Duration.minutes(2),
      environment: {
        TABLE_NAME: tableName
      }
    });
    analizeTextService.addToRolePolicy(
      new PolicyStatement({
        actions: ["textract:*"],
        resources: ["*"]
      })
    );
    return analizeTextService;
  }

  getS3TriggerService = (snsTopic: string, snsRole: string): Function => {
    const s3TriggerService = new Function(this, 'S3TriggerService', {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset('lambda'),
      handler: 's3triggerService.handler',
      memorySize: 128,
      timeout: Duration.minutes(1),
      environment: {
        SNS_TOPIC: snsTopic,
        TEXTRACT_SNS_ROLE: snsRole
      }
    });
    s3TriggerService.addToRolePolicy(
      new PolicyStatement({
        actions: ["textract:*"],
        resources: ["*"]
      })
    );
    return s3TriggerService;
  }


  private getQueuePolicyDocument(sqsQueueArn: string, snsTextractTopic: Topic): PolicyStatement {
    return new PolicyStatement({
      actions: ['SQS:SendMessage'],
      effect: Effect.ALLOW,
      resources: [sqsQueueArn],
      principals: [new Anyone()],
      conditions: {
        ArnLike: {
          "aws:SourceArn": snsTextractTopic.topicArn
        },
        StringEquals: {
          "aws:SourceAccount": this.account
        }
      }
    });
  }

  private getSignedUrlService(tablename: string, bucketName: string) {
    return new Function(this, 'SignedUrlService', {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset('lambda'),
      handler: 'getSignedUrl.handler',
      memorySize: 128,
      timeout: Duration.minutes(1),
      environment: {
        BUCKET_NAME: bucketName,
        TABLE_NAME: tablename
      }
    });
  }

  getSnsPolicyDocument(textractRoleArn: string, snsArn: string): PolicyStatement {
    return new PolicyStatement({
      actions: ['sns:Subscribe'],
      principals: [new Anyone()],
      effect: Effect.ALLOW,
      resources: [snsArn],
      conditions: {
        ArnLike: {
          "aws:SourceArn": textractRoleArn
        },
        StringEquals: {
          "aws:SourceAccount": this.account
        }
      }
    });
  }
}
