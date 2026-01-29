pipeline {
    agent any  // Runs on any Jenkins agent with Docker/compose installed

    environment {
        // Pull secrets from Jenkins credentials (add JWT_SECRET as 'secret text' cred ID: 'jwt-secret')
        JWT_SECRET = credentials('jwt-secret')
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Pull from GitHub
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                // Write .env with secret (don't commit .env)
                sh 'echo "JWT_SECRET=${JWT_SECRET}" > .env'
                sh 'echo "PORT=5000" >> .env'
                sh 'echo "MONGO_INITDB_DATABASE=expense-tracker" >> .env'
                sh 'docker-compose build'
            }
        }

        stage('Deploy Locally') {  // For testing; replace with AWS in Part 3
            steps {
                sh 'docker-compose down || true'  // Safe stop
                sh 'docker-compose up -d'  // Use existing builds, detach
                echo 'App deployed! Check http://localhost:3000 (or Jenkins server IP)'
            }
        }
    }

    post {
        success { echo 'Success! App is running.' }
        failure { echo 'Failed—check logs with docker-compose logs.' }
        always { sh 'rm -f .env' }  // Clean up secrets
    }
}