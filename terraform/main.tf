provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "expense_app" {
  ami           = "ami-0ff8a91507f77f867"  # Amazon Linux 2
  instance_type = "t3.micro"
  key_name = "expense-key" 
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data_replace_on_change = true  # Forces new instance on script change

    user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker -y
              service docker start
              usermod -a -G docker ec2-user

              # Pull images
              docker pull sarasii/expense-backend:latest
              docker pull sarasii/expense-frontend:latest

              # Create network
              docker network create expense-net || true

              # Run Mongo with restart
              docker run -d --restart unless-stopped --name mongo --network expense-net mongo:latest

              # Wait for Mongo to be fully ready (loop until port open)
              echo "Waiting for MongoDB to start..."
              until docker run --rm --network expense-net busybox sh -c "nc -z mongo 27017"; do
                sleep 5
              done
              echo "MongoDB is ready!"

              # Run backend with env vars and restart
              docker run -d --restart unless-stopped --name backend --network expense-net -p 5000:5000 \
                -e MONGO_URI=mongodb://mongo:27017/expense-tracker \
                -e JWT_SECRET=9c27f54e52dfbbb82309dacbe682ad0996b4b3d82c3eefa7803fa01b3f2202fb \
                -e PORT=5000 \
                sarasii/expense-backend:latest

              # Run frontend with restart
              docker run -d --restart unless-stopped --name frontend --network expense-net -p 80:80 sarasii/expense-frontend:latest
              EOF

  tags = {
    Name = "Expense-Tracker-DevOps"
  }
}

resource "aws_security_group" "app_sg" {
  name = "expense-app-sg"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["175.157.12.98/32"]  # Your IP
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "app_url" {
  value = "http://${aws_instance.expense_app.public_ip}"
}
output "backend_url" {
  value = "http://${aws_instance.expense_app.public_ip}:5000"
}