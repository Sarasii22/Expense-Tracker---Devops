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
                    echo "=== FORCE CLEANUP (this fixes the port error) ==="
                    docker stop mongo backend frontend 2>/dev/null || true
                    docker rm -f mongo backend frontend 2>/dev/null || true
                    
                    # Kill ANY container using the ports
                    docker ps -q --filter "publish=5000" | xargs -r docker rm -f || true
                    docker ps -q --filter "publish=80" | xargs -r docker rm -f || true
                    
                    # Aggressive port kill (fixes ghost ports)
                    fuser -k 5000/tcp 2>/dev/null || true
                    fuser -k 80/tcp 2>/dev/null || true
                    
                    echo "=== Waiting for ports to free (5s) ==="
                    sleep 5
                    
                    echo "=== Creating network ==="
                    docker network create expense-net 2>/dev/null || true
                    
                    echo "=== Starting MongoDB ==="
                    docker run -d --restart unless-stopped --name mongo --network expense-net mongo:latest
                    
                    echo "=== Waiting for MongoDB ==="
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
                    
                    echo "=== SUCCESS! Checking status ==="
                    docker ps
                    echo "App is live at: http://$(curl -s ifconfig.me)"
                    echo "Backend health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 || echo "FAILED")"
                '''
            }
        }
    }
    post {
        success { echo '✅ DEPLOYMENT COMPLETE' }
        failure { 
            echo '❌ FAILED — run this on server: docker logs backend'
            sh 'docker logs backend || true'
        }
    }
}