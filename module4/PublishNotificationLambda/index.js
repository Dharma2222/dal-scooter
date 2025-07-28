const AWS = require('aws-sdk');
const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    const { email, subject, body } = JSON.parse(event.body);

    if (!email || !subject || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing email, subject, or body' })
      };
    }

    await sns.publish({
      TopicArn: process.env.NOTIFICATION_TOPIC_ARN,
      Message: JSON.stringify({ email, subject, body })
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification sent' })
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
