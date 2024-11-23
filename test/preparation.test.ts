 import * as cdk from 'aws-cdk-lib';
 import { Template } from 'aws-cdk-lib/assertions';
 import * as Preparation from '../lib/preparation-stack';
 import 'jest-cdk-snapshot';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/preparation-stack.ts
test('SQS Queue Created', () => {
   const app = new cdk.App();
   const stack = new Preparation.PreparationStack(app, 'MyTestStack');
   expect(stack).toMatchCdkSnapshot();  
});
