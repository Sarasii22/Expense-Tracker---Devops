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
                    echo "=== SUPER AGGRESSIVE PORT CLEANUP ==="
                    docker stop mongo backend frontend 2>/dev/null || true
                    docker rm -f mongo backend frontend 2>/dev/null || true
                    docker rm -f $(docker ps -a -q) 2>/dev/null || true
                    
                    echo "=== CURRENT PORTS BEFORE KILL ==="
                    ss -tlnp | grep -E '5000|80' || echo "No ports bound"
                    
                    echo "=== KILLING ANY PROCESS ON 5000 & 80 ==="
                    for port in 5000 80; do
                        PID=$(ss -tlnp | grep ":$port " | awk '{print $7}' | cut -d, -f2 | cut -d= -f2 || true)
                        if [ -n "$PID" ]; then
                            echo "Killing PID $PID on port $port"
                            kill -9 $PID 2>/dev/null || true
                        fi
                    done
                    
                    echo "=== WAITING FOR PORTS TO FULLY FREE (15s) ==="
                    sleep 15
                    
                    echo "=== CREATING NETWORK ==="
                    docker network create expense-net 2>/dev/null || true
                    
                    echo "=== STARTING MONGODB ==="
                    docker run -d --restart unless-stopped --name mongo --network expense-net mongo:latest
                    
                    echo "=== WAITING FOR MONGODB ==="
                    for i in {1..40}; do
                        if docker run --rm --network expense-net busybox sh -c "nc -z mongo 27017" 2>/dev/null; then
                            echo "MongoDB ready!"
                            break
                        fi
                        sleep 1
                    done
                    
                    echo "=== STARTING BACKEND ==="
                    docker run -d --restart unless-stopped --name backend \
                        --network expense-net \
                        -p 5000:5000 \
                        -e MONGO_URI=mongodb://mongo:27017/expense-tracker \
                        -e JWT_SECRET=${JWT_SECRET} \
                        -e PORT=5000 \
                        sarasii/expense-backend:latest
                    
                    echo "=== STARTING FRONTEND ==="
                    docker run -d --restart unless-stopped --name frontend \
                        --network expense-net \
                        -p 80:80 \
                        sarasii/expense-frontend:latest
                    
                    echo "=== FINAL STATUS ==="
                    docker ps
                    echo "APP LIVE AT: http://$(curl -s ifconfig.me)"
                    echo "Backend check: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 || echo "DOWN")"
                '''
            }
        }
    }
    post {
        success { echo '✅ SUCCESS — CHECK THE URL ABOVE!' }
        failure { 
            echo '❌ FAILED'
            sh 'docker logs backend || true'
            sh 'ss -tlnp | grep -E "5000|80" || true'
        }
    }
}