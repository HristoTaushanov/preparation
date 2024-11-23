
import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { FilterCriteria, FilterRule, Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PreparationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const errorTable = new Table(this, 'ErrorTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      stream: StreamViewType.NEW_AND_OLD_IMAGES
    });

    const errorTopic = new Topic(this, 'ErrorTopic', {
      topicName: 'ErrorTopic'
    });

    const processFunction = new NodejsFunction(this, 'processFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: '${__dirname}/../src/processFunction.ts',
      environment: {
        TABLE_NAME: errorTable.tableName,
        TOPIC_ARN: errorTopic.topicArn
      }
    });

    const cleanupFunction = new NodejsFunction(this, 'cleanupFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: '${__dirname}/../src/cleanupFunction.ts',
      environment: {
        TABLE_NAME: errorTable.tableName,
        TOPIC_ARN: errorTopic.topicArn
      }
    });


    errorTopic.grantPublish(processFunction);
    errorTopic.grantPublish(cleanupFunction);
    errorTable.grantReadWriteData(processFunction);
    errorTable.grantReadWriteData(cleanupFunction);

    const api = new RestApi(this, 'ProcessorApi');
    const resource = api.root.addResource('processJASON');
    resource.addMethod('POST', new LambdaIntegration(processFunction));

    new Subscription(this, 'ErrorSubstription', {
      topic: errorTopic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'htaushanov@yahoo.com'
    });

    cleanupFunction.addEventSource(new DynamoEventSource(errorTable, {
      startingPosition: StartingPosition.LATEST,
      batchSize: 5,
      filters: [
          FilterCriteria.filter({
            eventName: FilterRule.isEqual('REMOVE'),
          })
      ]
    }));

    new cdk.CfnOutput(this, 'RESTApiEndpoint', {
      value: 'https://${api.restApiId}.execute-api.eu-central-1.amazonaws.com/prod/processJSON'
    });
  }
}
