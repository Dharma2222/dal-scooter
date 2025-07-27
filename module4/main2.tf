provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

# -------------------------
# DynamoDB Table
# -------------------------
resource "aws_dynamodb_table" "concerns" {
  name         = "ConcernTickets"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "concern_id"

  attribute {
    name = "concern_id"
    type = "S"
  }
}

# -------------------------
# SQS Queue
# -------------------------
resource "aws_sqs_queue" "concern_queue" {
  name = "CustomerConcernsQueue"
}

# -------------------------
# SubmitConcernLambda
# -------------------------
resource "aws_lambda_function" "submit_concern_lambda" {
  function_name = "SubmitConcernLambda"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  role               = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  filename           = "submitConcernLambda.zip"
  source_code_hash   = filebase64sha256("submitConcernLambda.zip")

  environment {
    variables = {
      SQS_URL = aws_sqs_queue.concern_queue.id
    }
  }
}

resource "aws_lambda_permission" "allow_apigateway_invoke_submit_concern" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit_concern_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:us-east-1:${data.aws_caller_identity.current.account_id}:fv3uizm1fd/*/*/concern/submit"
}

# -------------------------
# SNS Topic
# -------------------------
resource "aws_sns_topic" "franchise_notify" {
  name = "FranchiseConcernNotification"
}

# -------------------------
# ProcessConcernLambda
# -------------------------
resource "aws_lambda_function" "process_concern_lambda" {
  function_name = "ProcessConcernLambda"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  role               = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  filename           = "processConcernLambda.zip"
  source_code_hash   = filebase64sha256("processConcernLambda.zip")

  environment {
    variables = {
      USER_POOL_ID       = "us-east-1_xsSoFiHJd"
      CONCERNS_TABLE     = aws_dynamodb_table.concerns.name
      NOTIFY_TOPIC_ARN   = aws_sns_topic.franchise_notify.arn
    }
  }
}

# -------------------------
# Allow SQS to trigger Lambda
# -------------------------
resource "aws_lambda_event_source_mapping" "lambda_sqs_trigger" {
  event_source_arn = aws_sqs_queue.concern_queue.arn
  function_name    = aws_lambda_function.process_concern_lambda.arn
  batch_size       = 1
}

resource "aws_lambda_permission" "allow_sqs_to_invoke" {
  statement_id  = "AllowExecutionFromSQS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_concern_lambda.function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.concern_queue.arn
}

# -------------------------
# SNS Topic for Notifications
# -------------------------
resource "aws_sns_topic" "notification_topic" {
  name = "NotificationTopic"
}

# -------------------------
# SQS Queue for Notifications
# -------------------------
resource "aws_sqs_queue" "notification_queue" {
  name = "NotificationQueue"
}

# SQS queue policy allowing SNS to send messages
resource "aws_sqs_queue_policy" "notification_queue_policy" {
  queue_url = aws_sqs_queue.notification_queue.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowSNSPublish",
        Effect    = "Allow",
        Principal = {
          Service = "sns.amazonaws.com"
        },
        Action    = "sqs:SendMessage",
        Resource  = aws_sqs_queue.notification_queue.arn,
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.notification_topic.arn
          }
        }
      }
    ]
  })
}

# -------------------------
# SNS → SQS Subscription
# -------------------------
resource "aws_sns_topic_subscription" "notification_queue_sub" {
  topic_arn = aws_sns_topic.notification_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notification_queue.arn
  raw_message_delivery = true
}

# -------------------------
# Lambda to Send Email via Nodemailer
# -------------------------
resource "aws_lambda_function" "send_notification_lambda" {
  function_name = "SendNotificationLambda"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = "sendNotificationLambda.zip"
  source_code_hash = filebase64sha256("sendNotificationLambda.zip")
  role             = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  environment {
    variables = {
      SMTP_USER = "dalscooter2@gmail.com"
      SMTP_PASS = "sqkszfzflsiersjc"
    }
  }
}

# -------------------------
# Allow SQS to Trigger Lambda
# -------------------------
resource "aws_lambda_event_source_mapping" "trigger_notification_lambda" {
  event_source_arn = aws_sqs_queue.notification_queue.arn
  function_name    = aws_lambda_function.send_notification_lambda.arn
  batch_size       = 1
}

# -------------------------
# Lambda Permission for SQS
# -------------------------
resource "aws_lambda_permission" "allow_sqs_invoke_notification_lambda" {
  statement_id  = "AllowExecutionFromSQSNotification"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.send_notification_lambda.function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.notification_queue.arn
}
