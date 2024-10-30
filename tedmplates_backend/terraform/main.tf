provider "aws" {
  region  = "us-west-2"
  shared_credentials_files = ["~/.aws/credentials"]
}

# Create default VPC if one does not exist
resource "aws_default_vpc" "default_vpc" {
  tags = {
    Name = "Default VPC"
  }
}

data "aws_availability_zones" "available_zones" {}

resource "aws_default_subnet" "subnet_az1" {
  availability_zone = data.aws_availability_zones.available_zones.names[0]
}

resource "aws_default_subnet" "subnet_az2" {
  availability_zone = data.aws_availability_zones.available_zones.names[1]
}
