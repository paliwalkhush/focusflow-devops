pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'focusflow-backend'
        FRONTEND_IMAGE = 'focusflow-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out FocusFlow source code...'
                checkout scm
            }
        }

        stage('Backend Test') {
            steps {
                echo 'Installing backend dependencies...'

                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building FocusFlow Docker images...'

                sh 'docker build -t ${BACKEND_IMAGE}:latest ./backend'
                sh 'docker build -t ${FRONTEND_IMAGE}:latest ./frontend'
            }
        }

        stage('Docker Verify') {
            steps {
                echo 'Verifying Docker images...'

                sh 'docker images ${BACKEND_IMAGE}'
                sh 'docker images ${FRONTEND_IMAGE}'
            }
        }
    }

    post {
        success {
            echo 'FocusFlow CI pipeline completed successfully!'
        }

        failure {
            echo 'FocusFlow CI pipeline failed. Check the Jenkins console output.'
        }
    }
}