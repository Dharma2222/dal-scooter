const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { bookingRef, concern, type } = body;

    if (!bookingRef || !concern) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing bookingRef or concern" }),
      };
    }

    const userId = event.requestContext.authorizer.claims.sub;

    const message = {
      userId,
      bookingRef,
      concern,
      type: type || null,
      timestamp: new Date().toISOString(),
    };

    const result = await sqs.sendMessage({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(message),
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Concern submitted successfully",
        messageId: result.MessageId,
      }),
    };

  } catch (error) {
    console.error("Error submitting concern:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
