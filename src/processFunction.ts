export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;

    console.log(event);

    if(!event || !event.text){
        // Invalid JSON

    } else {
        // Publish to SNS
        
    }
    return {
        statusCode: 200,
        body: 'Hi from Lambda! Hi from Hristo Taushanov! Greetings to tha cat! :))))))'
    }
}