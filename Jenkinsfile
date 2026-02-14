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
                docker stop backend frontend || true
                docker rm backend frontend || true

                docker run -d --name backend -p 5000:5000 sarasii/expense-backend:latest
                docker run -d --name frontend -p 80:80 sarasii/expense-frontend:latest
                '''
            }
        }
    }
}
