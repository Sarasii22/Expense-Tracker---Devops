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
        stage('Build Images') {
            steps {
                sh 'docker build -t sarasii/expense-backend:latest ./backend'
                sh 'docker build -t sarasii/expense-frontend:latest ./frontend'
            }
        }
        stage('Docker Login') {
            steps {
                sh '''
                echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin
                '''
            }
        }
        stage('Push Images') {
            steps {
                sh 'docker push sarasii/expense-backend:latest'
                sh 'docker push sarasii/expense-frontend:latest'
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                    echo "=== Stopping old containers ==="
                    docker stop mongo backend frontend 2>/dev/null || true
                    docker rm mongo backend frontend 2>/dev/null || true
                    
                    echo "=== Creating network ==="
                    docker network create expense-net 2>/dev/null || true
                    
                    echo "=== Starting MongoDB ==="
                    docker run -d --restart unless-stopped --name mongo --network expense-net mongo:latest
                    
                    echo "=== Waiting for MongoDB (max 30s) ==="
                    for i in {1..30}; do
                        if docker run --rm --network expense-net busybox sh -c "nc -z mongo 27017" 2>/dev/null; then
                            echo "MongoDB is ready!"
                            break
                        fi
                        sleep 1
                    done
                    
                    echo "=== Starting Backend ==="
                    docker run -d --restart unless-stopped --name backend \
                        --network expense-net \
                        -p 5000:5000 \
                        -e MONGO_URI=mongodb://mongo:27017/expense-tracker \
                        -e JWT_SECRET=${JWT_SECRET} \
                        -e PORT=5000 \
                        sarasii/expense-backend:latest
                    
                    echo "=== Starting Frontend ==="
                    docker run -d --restart unless-stopped --name frontend \
                        --network expense-net \
                        -p 80:80 \
                        sarasii/expense-frontend:latest
                    
                    echo "=== Deployment done! ==="
                    echo "App should be live at: http://$(curl -s ifconfig.me)"
                '''
            }
        }
    }
    post {
        success {
            echo '✅ SUCCESS! Check the console output for the IP'
        }
        failure {
            echo '❌ Failed - check logs: docker logs backend'
        }
    }
}