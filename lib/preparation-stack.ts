import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
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
      billingMode: BillingMode.PAY_PER_REQUEST
    });


    const processFunction = new NodejsFunction(this, 'processFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: '${__dirname}/../src/processFunction.ts'
    });

    const api = new RestApi(this, 'ProcessorApi');
    const resource = api.root.addResource('processJASON');
    resource.addMethod('POST', new LambdaIntegration(processFunction));

    new cdk.CfnOutput(this, 'RESTApiEndpoint', {
      value: 'https://${api.restApiId}.execute-api.eu-central-1.amazonaws.com/prod/processJSON'
    });
  }
}
