const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'MyDockerLambdaTable';

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Extract action from the event. Default to "add" if none provided, but ideally
    // the EventBridge rule should always provide an action.
    const action = event.action || 'add';
    console.log(`Action determined: ${action}`);

    if (action === 'add') {
        // Add a new item with the current timestamp
        const now = Date.now();
        const newItem = { id: `item-${now}`, timestamp: now };
        console.log('Adding a new item:', newItem);

        await dynamo.put({ TableName: TABLE_NAME, Item: newItem }).promise();
        console.log('Item added successfully.');

        // Read all items in the table
        const data = await dynamo.scan({ TableName: TABLE_NAME }).promise();
        const items = data.Items || [];
        console.log('Current items in DynamoDB:', items);

        return { statusCode: 200, body: 'Items added/read successfully.' };

    } else if (action === 'clear') {
        console.log('Clearing table...');

        // Scan to get all items
        const data = await dynamo.scan({ TableName: TABLE_NAME }).promise();
        const items = data.Items || [];
        console.log(`Found ${items.length} items to delete.`);

        for (let item of items) {
            await dynamo.delete({ TableName: TABLE_NAME, Key: { id: item.id } }).promise();
        }

        console.log('Table cleared. Now empty.');
        return { statusCode: 200, body: 'Table cleared.' };

    } else {
        console.error(`Unknown action: ${action}`);
        return { statusCode: 400, body: 'Unknown action.' };
    }
};
