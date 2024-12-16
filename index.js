const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'MyDockerLambdaTable';

exports.handler = async (event) => {
    const now = Date.now();
    const intervalCount = Math.floor((now - (process.env.START_TIME || now)) / (5 * 60 * 1000)) || 0;

    // Add a new item
    const newItem = { id: `item-${now}`, timestamp: now };
    await dynamo.put({ TableName: TABLE_NAME, Item: newItem }).promise();

    // Read all items
    const data = await dynamo.scan({ TableName: TABLE_NAME }).promise();
    const items = data.Items;
    console.log(`Current items in DynamoDB:`, items);

    // Every 20 minutes
    if ((intervalCount % 4) === 0 && intervalCount !== 0) {
        console.log(`20 minutes passed. Clearing table...`);
        for (let item of items) {
            await dynamo.delete({ TableName: TABLE_NAME, Key: { id: item.id } }).promise();
        }
        console.log(`Table cleared. Now empty.`);
    }

    return { statusCode: 200, body: 'Success' };
};
