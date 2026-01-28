pipeline {
    agent any

    stages {
        stage('Build Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Deploy (Preserve Data)') {
            steps {
                sh 'docker-compose down || true'  // Safe stop
                sh 'docker-compose up -d --build'  // Deploy fresh, keep mongo-data
                echo 'App deployed! Check http://localhost:3000'
            }
        }
    }

    post {
        success { echo 'Success! App is running.' }
        failure { echo 'Failed—check logs.' }
    }
}
