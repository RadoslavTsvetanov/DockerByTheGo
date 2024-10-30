variable "db_username" {
  description = "Database username"
  type        = string
  default     = "foo"
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = "foobarbaz"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "mydb"
}

variable "lambda_memory_size" {
  description = "Lambda memory size"
  type        = number
  default     = 128
}

variable "lambda_timeout" {
  description = "Lambda timeout"
  type        = number
  default     = 10
}
