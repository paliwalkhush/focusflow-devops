terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security group: SSH (22) for Ansible, HTTP (80) for the app (nginx serves the
# React build and reverse-proxies /api to the backend container)
resource "aws_security_group" "focusflow_sg" {
  name        = "focusflow-sg"
  description = "Allow SSH and HTTP for FocusFlow Pomodoro app"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # tighten to your IP for real use
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "focusflow-sg"
  }
}

resource "aws_instance" "focusflow_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.focusflow_sg.id]

  root_block_device {
    volume_size = 12 # a bit more room than default: node_modules + docker images
    volume_type = "gp3"
  }

  tags = {
    Name = "focusflow-pomodoro-server"
  }
}

output "instance_public_ip" {
  value = aws_instance.focusflow_server.public_ip
}
