pipeline {
    agent any

    environment {
        PROJECT_ID = 'focus-flow-508619'
        REGION = 'us-central1'
        REGISTRY = 'us-central1-docker.pkg.dev'
        REPOSITORY = 'focusflow'

        BACKEND_IMAGE = "${REGISTRY}/${PROJECT_ID}/${REPOSITORY}/focusflow-backend"
        FRONTEND_IMAGE = "${REGISTRY}/${PROJECT_ID}/${REPOSITORY}/focusflow-frontend"
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
                echo 'Installing backend dependencies and running tests...'

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

        stage('Docker Push') {
            steps {
                echo 'Pushing Docker images to Google Artifact Registry...'

                sh '''
                    TOKEN=$(curl --noproxy "*" -s \
                    -H "Metadata-Flavor: Google" \
                    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" |
                    python3 -c "import sys,json; print(json.load(sys.stdin)[\\"access_token\\"])")

                    echo "$TOKEN" | docker login \
                    -u oauth2accesstoken \
                    --password-stdin \
                    https://${REGISTRY}

                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Docker Verify') {
            steps {
                echo 'Verifying pushed Docker images...'

                sh 'docker images ${BACKEND_IMAGE}'
                sh 'docker images ${FRONTEND_IMAGE}'
            }
        }
    }

    post {
        success {
            echo 'FocusFlow CI/CD image pipeline completed successfully!'
        }

        failure {
            echo 'FocusFlow pipeline failed. Check the Jenkins console output.'
        }
    }
}