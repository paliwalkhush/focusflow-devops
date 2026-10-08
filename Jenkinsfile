pipeline {
    agent any

    environment {
        PROJECT_ID = 'focus-flow-508619'
        REGION = 'us-central1'
        CLUSTER = 'focusflow-cluster'

        REGISTRY = 'us-central1-docker.pkg.dev'
        REPOSITORY = 'focusflow'

        BACKEND_IMAGE = "${REGISTRY}/${PROJECT_ID}/${REPOSITORY}/focusflow-backend"
        FRONTEND_IMAGE = "${REGISTRY}/${PROJECT_ID}/${REPOSITORY}/focusflow-frontend"

        NAMESPACE = 'focusflow'
        HELM_CHART = './helm/focusflow-helm'

        KUBECTL = '/usr/bin/kubectl'
        HELM = '/usr/local/bin/helm'
        GCLOUD = '/snap/bin/gcloud'
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
                    TOKEN=$(${GCLOUD} auth print-access-token)

                    echo "$TOKEN" | docker login \
                    -u oauth2accesstoken \
                    --password-stdin \
                    https://${REGISTRY}

                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Configure GKE Access') {
            steps {
                echo 'Configuring kubectl access to GKE...'

                sh '''
                    mkdir -p "$WORKSPACE/.kube"

                    export KUBECONFIG="$WORKSPACE/.kube/config"

                    ${GCLOUD} container clusters get-credentials ${CLUSTER} \
                    --region ${REGION} \
                    --project ${PROJECT_ID}

                    ${KUBECTL} get nodes
                '''
            }
        }

        stage('Helm Deploy') {
            steps {
                echo 'Deploying FocusFlow to GKE using Helm...'

                sh '''
                    export KUBECONFIG="$WORKSPACE/.kube/config"

                    ${HELM} upgrade --install focusflow ${HELM_CHART} \
                    --namespace ${NAMESPACE} \
                    --create-namespace \
                    --wait \
                    --timeout 10m
                '''
            }
        }

        stage('Helm Test') {
            steps {
                echo 'Running Helm tests...'

                sh '''
                    export KUBECONFIG="$WORKSPACE/.kube/config"

                    ${HELM} test focusflow \
                    --namespace ${NAMESPACE} \
                    --logs
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying FocusFlow deployment...'

                sh '''
                    export KUBECONFIG="$WORKSPACE/.kube/config"

                    ${KUBECTL} get deployments -n ${NAMESPACE}

                    ${KUBECTL} get pods -n ${NAMESPACE}

                    ${KUBECTL} get services -n ${NAMESPACE}
                '''
            }
        }
    }

    post {
        success {
            echo '=============================================='
            echo 'FocusFlow CI/CD pipeline completed successfully!'
            echo 'Docker images pushed to Artifact Registry.'
            echo 'Application deployed to GKE using Helm.'
            echo '=============================================='
        }

        failure {
            echo '=============================================='
            echo 'FocusFlow CI/CD pipeline FAILED.'
            echo 'Check the Jenkins console output.'
            echo '=============================================='
        }
    }
}