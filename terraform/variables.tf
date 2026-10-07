variable "aws_region" {
  description = "AWS region to deploy in"
  type        = string
  default     = "ap-south-1" # Mumbai; change if you want a different region
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID for the chosen region (check AWS Console -> AMI Catalog for the current one)"
  type        = string
  default     = "ami-0f5ee92e2d63afc18" # Ubuntu 22.04 LTS, ap-south-1 (verify before apply)
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t2.micro" # free-tier eligible; t2.small if you need more headroom for docker builds
}

variable "key_name" {
  description = "Name of the AWS key pair you created (e.g. focusflow-key)"
  type        = string
  default     = "focusflow-key"
}
