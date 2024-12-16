const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'MyDockerLambdaTable';

exports.handler = async (event) => {
    // The action will be passed through EventBridge event input transformer
    const action = event.action || 'add';

    if (action === 'add') {
        // Add a new item
        const now = Date.now();
        const newItem = { id: `item-${now}`, timestamp: now };
        await dynamo.put({ TableName: TABLE_NAME, Item: newItem }).promise();

        // Read all items
        const data = await dynamo.scan({ TableName: TABLE_NAME }).promise();
        const items = data.Items;
        console.log(`Current items in DynamoDB:`, items);

        // No clearing here, just add/read
        return { statusCode: 200, body: 'Items added/read successfully.' };

    } else if (action === 'clear') {
        // Clear the table
        console.log(`Clearing table...`);
        const data = await dynamo.scan({ TableName: TABLE_NAME }).promise();
        const items = data.Items || [];

        for (let item of items) {
            await dynamo.delete({ TableName: TABLE_NAME, Key: { id: item.id } }).promise();
        }

        console.log(`Table cleared. Now empty.`);
        return { statusCode: 200, body: 'Table cleared.' };
    }

    // If no recognized action
    return { statusCode: 400, body: 'Unknown action.' };
};

