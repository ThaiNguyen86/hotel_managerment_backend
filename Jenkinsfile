pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "ngtthai/hotel-backend"
    }
    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-credential',
                    url: 'https://github.com/ThaiNguyen86/hotel_managerment_backend.git'
            }
        }
        stage('Build Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                }
            }
        }
        stage('Push Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credential') {
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_NUMBER}").push('latest')
                    }
                }
            }
        }
        stage('Deploy Container') {
            steps {
                sh '''
                  docker pull ${DOCKER_IMAGE}:${BUILD_NUMBER}
                  docker stop hotel_backend || true
                  docker rm hotel_backend || true
                  docker run -d --name hotel_backend -p 3002:4000 ${DOCKER_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }
    }
}
