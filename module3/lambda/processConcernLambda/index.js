const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    const franchiseTopicMap = {
      "mdharma019@gmail.com": "arn:aws:sns:us-east-1:241665878536:FranchiseNotify_mdharma019",
      "savanpatel0070@gmail.com": "arn:aws:sns:us-east-1:241665878536:FranchiseNotify_savanpatel0070",
      "satiyapragaash23@gmail.com": "arn:aws:sns:us-east-1:241665878536:FranchiseNotify_satiyapragaash23",
      "priyanshsolanki1@gmail.com": "arn:aws:sns:us-east-1:241665878536:FranchiseNotify_priyanshsolanki1"
    };

    for (const record of event.Records) {
      const message = JSON.parse(record.body);

      // ✅ Use `message.email` now instead of userId
      const userEmail = message.email;
      if (!userEmail) {
        console.warn("Missing email in message:", message);
        continue;
      }

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
      const franchiseEmail = selectedUser.Attributes?.find(attr => attr.Name === 'email')?.Value;
      const franchiseName = selectedUser.Attributes?.find(attr => attr.Name === 'name')?.Value;

      const concernRecord = {
        concern_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user_email: userEmail, // ✅ Store email instead of userId
        franchise_id: selectedUser.Username,
        franchise_email: franchiseEmail || null,
        franchise_name: franchiseName || null,
        booking_ref: message.bookingRef,
        concern_text: message.concern,
        type: message.type || null,
        status: 'pending',
        timestamp: message.timestamp,
      };

      await dynamodb.put({
        TableName: process.env.CONCERNS_TABLE,
        Item: concernRecord,
      }).promise();

      const topicArn = franchiseTopicMap[franchiseEmail];
      if (topicArn) {
        await sns.publish({
          TopicArn: topicArn,
          Subject: "New DALScooter Concern Assigned",
          Message: `Hello ${franchiseName || "Franchise"},\n\nYou have been assigned a new concern:\n\n${JSON.stringify(concernRecord, null, 2)}`
        }).promise();
        console.log(`Concern assigned and email sent to ${franchiseEmail}`);
      } else {
        console.warn(`No SNS topic mapped for ${franchiseEmail}`);
      }
    }

    return { statusCode: 200 };
  } catch (error) {
    console.error("Error processing concern:", error);
    return { statusCode: 500 };
  }
};
