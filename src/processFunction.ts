import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";


const snsClient = new SNSClient({});
const dynamoDBClient = new DynamoDBClient({});

export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;
    const topicArn = process.env.TOPIC_ARN;
    console.log(event);

    if(!event || !event.text){
        // Invalid JSON

    } else {
        // Publish to SNS
        await snsClient.send(new PublishCommand( {
            TopicArn: topicArn,
            Message: `Valid JSON received: ${event.text}`
            }
        ))
        
    }
    return {
        statusCode: 200,
        body: 'Hi from Lambda! Hi from Hristo Taushanov! Greetings to tha cat! :))))))'
    }
}