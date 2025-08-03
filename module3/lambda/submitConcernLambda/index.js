const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.requestContext?.http?.method === "OPTIONS") {
    console.log("OPTIONS preflight request");
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("Parsed body:", body);

    const { email, bookingRef, concern, type } = body;

    if (!email || !bookingRef || !concern) {
      console.warn("Missing email, bookingRef, or concern");
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing email, bookingRef, or concern" }),
      };
    }

    const message = {
      email,
      bookingRef,
      concern,
      type: type || null,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending message to SQS:", message);

    const result = await sqs.sendMessage({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(message),
    }).promise();

    console.log("SQS sendMessage result:", result);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Concern submitted successfully",
        messageId: result.MessageId,
      }),
    };

  } catch (error) {
    console.error("Error submitting concern:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
