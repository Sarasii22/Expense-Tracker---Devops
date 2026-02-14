pipeline {
    agent any

    environment {
        JWT_SECRET = credentials('jwt-secret')

        DOCKERHUB_USER = "sarasii"
        BACKEND_IMAGE = "sarasii/expense-backend:latest"
        FRONTEND_IMAGE = "sarasii/expense-frontend:latest"

        EC2_IP = "54.243.18.183"
        SSH_KEY = "~/.ssh/expense-key.pem"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh 'docker build -t $BACKEND_IMAGE ./backend'
                sh 'docker build -t $FRONTEND_IMAGE ./frontend'
            }
        }

        stage('Push Images to DockerHub') {
            steps {
                sh 'docker push $BACKEND_IMAGE'
                sh 'docker push $FRONTEND_IMAGE'
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh """
                ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ec2-user@${EC2_IP} << 'EOF'

                docker pull ${BACKEND_IMAGE}
                docker pull ${FRONTEND_IMAGE}

                docker stop backend frontend || true
                docker rm backend frontend || true

                docker run -d --restart unless-stopped --name backend -p 5000:5000 \
                  -e JWT_SECRET=${JWT_SECRET} \
                  ${BACKEND_IMAGE}

                docker run -d --restart unless-stopped --name frontend -p 80:80 \
                  ${FRONTEND_IMAGE}

                EOF
                """
            }
        }
    }

    post {
        success {
            echo "Deployment successful! Check http://${EC2_IP}"
        }
        failure {
            echo "Deployment failed. Check logs."
        }
    }
}
