pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = credentials('docker-registry')
        DOCKER_IMAGE_PREFIX = 'cryptolotto'
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                }
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: 'NodeJS-18', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Type Check') {
                    steps {
                        sh 'npm run type-check'
                    }
                }
                stage('Format Check') {
                    steps {
                        sh 'npm run format:check'
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        sh 'npm run test:frontend'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'frontend/coverage/junit.xml'
                            publishCoverage adapters: [
                                istanbulCoberturaAdapter('frontend/coverage/cobertura-coverage.xml')
                            ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        sh 'npm run test:backend'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'backend/coverage/junit.xml'
                            publishCoverage adapters: [
                                istanbulCoberturaAdapter('backend/coverage/cobertura-coverage.xml')
                            ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        sh 'npm run build:frontend'
                    }
                }
                stage('Build Backend') {
                    steps {
                        sh 'npm run build:backend'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level moderate'
                // Add additional security scanning tools here
                // sh 'docker run --rm -v $(pwd):/app securecodewarrior/docker-security-scan'
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            def frontendImage = docker.build("${DOCKER_IMAGE_PREFIX}-frontend:${GIT_COMMIT_SHORT}", "-f frontend/Dockerfile .")
                            frontendImage.tag("${DOCKER_IMAGE_PREFIX}-frontend:latest")
                            frontendImage.tag("${DOCKER_IMAGE_PREFIX}-frontend:build-${BUILD_NUMBER}")
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        script {
                            def backendImage = docker.build("${DOCKER_IMAGE_PREFIX}-backend:${GIT_COMMIT_SHORT}", "-f backend/Dockerfile .")
                            backendImage.tag("${DOCKER_IMAGE_PREFIX}-backend:latest")
                            backendImage.tag("${DOCKER_IMAGE_PREFIX}-backend:build-${BUILD_NUMBER}")
                        }
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'release/*'
                }
            }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        def frontendImage = docker.image("${DOCKER_IMAGE_PREFIX}-frontend:${GIT_COMMIT_SHORT}")
                        def backendImage = docker.image("${DOCKER_IMAGE_PREFIX}-backend:${GIT_COMMIT_SHORT}")
                        
                        frontendImage.push()
                        frontendImage.push("latest")
                        frontendImage.push("build-${BUILD_NUMBER}")
                        
                        backendImage.push()
                        backendImage.push("latest")
                        backendImage.push("build-${BUILD_NUMBER}")
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh '''
                        docker-compose -f docker-compose.staging.yml down
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    sh '''
                        docker-compose -f docker-compose.prod.yml down
                        docker-compose -f docker-compose.prod.yml pull
                        docker-compose -f docker-compose.prod.yml up -d
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh '''
                        sleep 30
                        curl -f http://localhost:3000/health || exit 1
                        curl -f http://localhost:3001/health || exit 1
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ CryptoLotto deployment successful! Branch: ${env.BRANCH_NAME}, Build: ${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ CryptoLotto deployment failed! Branch: ${env.BRANCH_NAME}, Build: ${env.BUILD_NUMBER}"
            )
        }
    }
}