
resource "aws_security_group" "database_security_group" {
  name        = "database_security_group"
  description = "Enable PostgreSQL access on port 5432"
  vpc_id      = aws_default_vpc.default_vpc.id

  ingress {
    description     = "PostgreSQL access"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]  
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "database_security_group"
  }
}

resource "aws_db_subnet_group" "database_subnet_group" {
  name         = "my-database-subnet-group"
  subnet_ids   = [aws_default_subnet.subnet_az1.id, aws_default_subnet.subnet_az2.id]
  description  = "Subnet group for RDS instance"

  tags = {
    Name = "database_subnet_group"
  }
}

resource "aws_db_instance" "db_instance" {
allocated_storage    = 10
  db_name              = var.db_name 
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t3.micro"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.mysql8.0"
  skip_final_snapshot  = true
}
