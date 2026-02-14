pipeline {
    agent any
    environment {
        JWT_SECRET = credentials('jwt-secret')
        DOCKER_CREDS = credentials('dockerhub-creds')
    }
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        stage('Build & Push Images') {
            steps {
                sh 'docker build -t sarasii/expense-backend:latest ./backend'
                sh 'docker build -t sarasii/expense-frontend:latest ./frontend'
                sh '''
                echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin
                docker push sarasii/expense-backend:latest
                docker push sarasii/expense-frontend:latest
                '''
            }
        }
        stage('Deploy to AWS') {
            steps {
                sshagent(['aws-ec2-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ec2-user@54.243.18.183 << 'EOF'
                    docker pull sarasii/expense-backend:latest
                    docker pull sarasii/expense-frontend:latest
                    
                    docker stop mongo backend frontend || true
                    docker rm mongo backend frontend || true
                    
                    docker network create expense-net || true
                    
                    docker run -d --restart unless-stopped --name mongo --network expense-net mongo:latest
                    
                    sleep 10
                    
                    docker run -d --restart unless-stopped --name backend --network expense-net -p 5000:5000 \
                      -e MONGO_URI=mongodb://mongo:27017/expense-tracker \
                      -e JWT_SECRET=${JWT_SECRET} \
                      -e PORT=5000 \
                      sarasii/expense-backend:latest
                    
                    docker run -d --restart unless-stopped --name frontend --network expense-net -p 80:80 sarasii/expense-frontend:latest
                    
                    echo "Deploy complete on AWS!"
                    docker ps
                    EOF
                    '''
                }
            }
        }
    }
    post {
        success { echo '✅ Changes LIVE on http://54.243.18.183' }
        failure { echo '❌ Deploy failed - check logs' }
    }
}