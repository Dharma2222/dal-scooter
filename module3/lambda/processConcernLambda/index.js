const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);

      const userPoolId = process.env.USER_POOL_ID;

      const usersResponse = await cognito.listUsersInGroup({
        UserPoolId: userPoolId,
        GroupName: "Franchise",
        Limit: 60,
      }).promise();

      const franchiseUsers = usersResponse.Users;

      if (!franchiseUsers.length) {
        console.error("No franchise users found.");
        continue;
      }

      const selectedUser = franchiseUsers[Math.floor(Math.random() * franchiseUsers.length)];

      // Extract franchise email and name from Cognito attributes
      const franchiseEmail = selectedUser.Attributes?.find(attr => attr.Name === 'email')?.Value;
      const franchiseName = selectedUser.Attributes?.find(attr => attr.Name === 'name')?.Value;

      const concernRecord = {
        concern_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user_id: message.userId,
        franchise_id: selectedUser.Username,
        franchise_email: franchiseEmail || null,
        franchise_name: franchiseName || null,
        booking_ref: message.bookingRef,
        concern_text: message.concern,
        type: message.type || null,
        status: 'pending',
        timestamp: message.timestamp,
      };

      // Save concern to DynamoDB
      await dynamodb.put({
        TableName: process.env.CONCERNS_TABLE,
        Item: concernRecord,
      }).promise();

      // Send SNS notification
      if (franchiseEmail && process.env.NOTIFY_TOPIC_ARN) {
        await sns.publish({
          Message: `New concern assigned to ${franchiseEmail}:\n\n${JSON.stringify(concernRecord, null, 2)}`,
          Subject: 'New DALScooter Concern Assigned',
          TopicArn: process.env.NOTIFY_TOPIC_ARN,
        }).promise();
      }

      console.log(`Concern assigned to ${selectedUser.Username}`);
    }

    return { statusCode: 200 };

  } catch (error) {
    console.error("Error processing concern:", error);
    return { statusCode: 500 };
  }
};
