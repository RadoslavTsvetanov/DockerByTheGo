resource "aws_lambda_layer_version" "my_lambda_layer" {
  layer_name = "my_lambda_layer"
  compatible_runtimes = ["nodejs14.x"]

  filename = "layer.zip"
  source_code_hash = filebase64sha256("layer.zip")
}
