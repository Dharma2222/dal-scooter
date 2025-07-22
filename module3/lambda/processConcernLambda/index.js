const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);

      // Step 1: Fetch franchise users from Cognito
      const userPoolId = process.env.USER_POOL_ID;

      const usersResponse = await cognito.listUsersInGroup({
        UserPoolId: userPoolId,
        GroupName: "Franchise",  // Capitalized as shown in your screenshot
        Limit: 60,
      }).promise();

      const franchiseUsers = usersResponse.Users;

      if (!franchiseUsers.length) {
        console.error("No franchise users found.");
        continue;
      }

      const selectedUser = franchiseUsers[Math.floor(Math.random() * franchiseUsers.length)];

      const concernRecord = {
        concern_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user_id: message.userId,
        franchise_id: selectedUser.Username,
        booking_ref: message.bookingRef,
        concern_text: message.concern,
        type: message.type || null,
        status: 'pending',
        timestamp: message.timestamp,
      };

      // Step 2: Save concern to DynamoDB
      await dynamodb.put({
        TableName: process.env.CONCERNS_TABLE,
        Item: concernRecord,
      }).promise();

      // Optional: Send SNS or SES notification to franchise email

      const franchiseEmail = selectedUser.Attributes.find(attr => attr.Name === 'email')?.Value;
      if (franchiseEmail) {
        await sns.publish({
          Message: `New concern assigned:\n\n${JSON.stringify(concernRecord, null, 2)}`,
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
