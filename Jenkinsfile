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
                    echo "=== AGGRESSIVE CLEANUP ==="
                    docker stop mongo backend frontend 2>/dev/null || true
                    docker rm -f mongo backend frontend 2>/dev/null || true
                    docker rm -f $(docker ps -a -q) 2>/dev/null || true
                    
                    echo "=== KILLING PORTS 5001, 5000, 80 ==="
                    for port in 5001 5000 80; do
                        fuser -k ${port}/tcp 2>/dev/null || true
                        sleep 1
                    done
                    
                    echo "=== WAITING 10s FOR PORTS ==="
                    sleep 10
                    
                    echo "=== CREATING NETWORK ==="
                    docker network create expense-net 2>/dev/null || true
                    
                    echo "=== STARTING MONGODB ==="
                    docker run -d --restart unless-stopped --name mongo --network expense-net mongo:latest
                    
                    echo "=== WAITING FOR MONGODB ==="
                    for i in {1..30}; do
                        if docker run --rm --network expense-net busybox sh -c "nc -z mongo 27017" 2>/dev/null; then
                            echo "MongoDB ready!"
                            break
                        fi
                        sleep 1
                    done
                    
                    echo "=== STARTING BACKEND (on host port 5001) ==="
                    docker run -d --restart unless-stopped --name backend \
                        --network expense-net \
                        -p 5001:5000 \
                        -e MONGO_URI=mongodb://mongo:27017/expense-tracker \
                        -e JWT_SECRET=${JWT_SECRET} \
                        -e PORT=5000 \
                        sarasii/expense-backend:latest
                    
                    echo "=== STARTING FRONTEND ==="
                    docker run -d --restart unless-stopped --name frontend \
                        --network expense-net \
                        -p 80:80 \
                        sarasii/expense-frontend:latest
                    
                    echo "=== DEPLOYMENT COMPLETE ==="
                    docker ps
                    echo "YOUR APP IS LIVE AT: http://$(curl -s ifconfig.me)"
                    echo "Backend health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001 || echo "DOWN")"
                '''
            }
        }
    }
    post {
        success { echo '✅ SUCCESS! Open the URL above in browser' }
        failure { 
            echo '❌ FAILED'
            sh 'docker logs backend || true'
        }
    }
}