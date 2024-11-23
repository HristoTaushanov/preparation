export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;
    return {
        statusCode: 200,
        body: 'Hi from Lambda! Hi from Hristo Taushanov! Greetings to tha cat! :))))))'
    }
}