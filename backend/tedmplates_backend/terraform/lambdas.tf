# Lambda execution role
resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Attach basic Lambda execution role
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach VPC execution role
resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_lambda_function" "function_to_get_envs_and_creds" {
  function_name = "EnvLambda"
  handler          = "index.handler"
  filename = "../lambda/secrets_lambda/secrets_lambda.zip"
  role = aws_iam_role.lambda_exec_role.arn
  memory_size = var.lambda_memory_size
  timeout          = var.lambda_timeout
  layers          = [aws_lambda_layer_version.my_lambda_layer.arn]
  runtime = "nodejs18.x" 
}

# GET Lambda function
resource "aws_lambda_function" "get_lambda" {
  filename         = "../lambda/functions/functions.zip"
  function_name    = "GetLambda"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "index.get_handler"
  runtime          = "nodejs18.x"
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout
  layers          = [aws_lambda_layer_version.my_lambda_layer.arn]
  
  environment { # replace and instead use thee func which gives you the envs 
    variables = {
      DB_HOST     = aws_db_instance.db_instance.address
      DB_USER     = var.db_username
      DB_PASSWORD = var.db_password
      DB_NAME     = var.db_name
    }
  }

  vpc_config {
    subnet_ids         = [aws_default_subnet.subnet_az1.id, aws_default_subnet.subnet_az2.id]
    security_group_ids = [aws_security_group.database_security_group.id]
  }
}

# POST Lambda function
resource "aws_lambda_function" "post_lambda" {
  filename         = "../lambda/functions/functions.zip"
  function_name    = "PostLambda"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "index.post_handler"
  runtime          = "nodejs18.x"
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout
  layers          = [aws_lambda_layer_version.my_lambda_layer.arn]
  
  environment {
    variables = {
      DB_HOST     = aws_db_instance.db_instance.address
      DB_USER     = var.db_username
      DB_PASSWORD = var.db_password
      DB_NAME     = var.db_name
    }
  }

  vpc_config {
    subnet_ids         = [aws_default_subnet.subnet_az1.id, aws_default_subnet.subnet_az2.id]
    security_group_ids = [aws_security_group.database_security_group.id]
  }
}