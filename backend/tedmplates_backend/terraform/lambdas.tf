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

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "get_lambda" {
  filename         = "../lambda/functions/funcctions.zip"
  function_name    = "GetLambda"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "index.get_handler"
  runtime          = "nodejs18.x"
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout
layers        = [aws_lambda_layer_version.my_lambda_layer.arn]


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

resource "aws_lambda_function" "post_lambda" {
  filename         = "../lambda/functions/funcctions.zip"
  function_name    = "PostLambda"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "index.post_handler"
  runtime          = "nodejs18.x"
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout
  layers        = [aws_lambda_layer_version.my_lambda_layer.arn]


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
