pipeline {
    agent any
    
    tools {
        nodejs "node-22" 
    }
    
    environment {
        NEXUS_URL = 'http://192.168.33.10:8081'
        NEXUS_REPOSITORY = 'docker-hosted'
        NEXUS_CREDENTIAL_ID = 'nexus-credentials'
    }
    
    stages {
        stage('Git') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Rabyous1/Maps.git'
                echo "Getting Project from Git"
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('server') {
                    sh '''
                        npm config set strict-ssl false
                        npm install --legacy-peer-deps --no-audit
                    '''
                    echo "Server dependencies installed successfully"
                }
                dir('client') {
                    sh '''
                        npm config set strict-ssl false
                        npm install --legacy-peer-deps --no-audit
                        npm install emoji-mart @emoji-mart/data @emoji-mart/react --legacy-peer-deps
                    '''
                    echo "Client dependencies installed successfully"
                }
            }
        }
        
        stage('Build') {
            steps {
                dir('server') {
                    sh 'npm run build'
                    echo "Server build completed successfully"
                }
                dir('client') {
                    sh 'npm run build'
                    echo "Client build completed successfully"
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                dir('server') {
                    sh 'npm run test:unit'
                    echo "Unit tests completed successfully"
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                dir('server') {
                    sh 'npm run test:integration'
                    echo "Integration tests completed successfully"
                }
            }
        }
        
        stage('Code Coverage') {
            steps {
                dir('server') {
                    sh 'npm run test:coverage'
                    echo "Code coverage analysis completed"
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                dir('server') {
                    sh "npx sonar-scanner -Dsonar.token=sqa_fc767b0048667803a7b4749b9891d69cba614d94"
                    echo "SonarQube analysis completed"
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    try {
                        echo 'Building Docker images...'
                        sh 'docker-compose build'
                        echo "Docker images built successfully"
                    } catch (Exception e) {
                        echo "Docker build failed: ${e.getMessage()}"
                        error "Docker build failed"
                    }
                }
            }
        }
        
        stage('Nexus') {
            steps {
                script {
                    try {
                        echo 'Pushing Docker images to Nexus Repository...'
                        withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIAL_ID, usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
                            sh """
                                docker login -u \$NEXUS_USER -p \$NEXUS_PASSWORD ${env.NEXUS_URL}
                                
                                # Tag images for Nexus
                                docker tag maps_server:latest ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-server:${BUILD_NUMBER}
                                docker tag maps_client:latest ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-client:${BUILD_NUMBER}
                                docker tag maps_server:latest ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-server:latest
                                docker tag maps_client:latest ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-client:latest
                                
                                # Push to Nexus
                                docker push ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-server:${BUILD_NUMBER}
                                docker push ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-client:${BUILD_NUMBER}
                                docker push ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-server:latest
                                docker push ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-client:latest
                                
                                # Cleanup local tagged images
                                docker rmi ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-server:${BUILD_NUMBER} || true
                                docker rmi ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-client:${BUILD_NUMBER} || true
                                docker rmi ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-server:latest || true
                                docker rmi ${env.NEXUS_URL}/${env.NEXUS_REPOSITORY}/pentabell-maps-client:latest || true
                            """
                        }
                        echo "Images pushed to Nexus successfully"
                    } catch (Exception e) {
                        echo "Nexus push failed: ${e.getMessage()}"
                        error "Nexus push failed"
                    }
                }
            }
        }
        
        stage('Deploy with Docker') {
            steps {
                script {
                    try {
                        echo 'Deploying with Docker Compose...'
                        sh 'docker-compose down || true'
                        sh 'docker-compose up -d'
                        echo "Docker deployment completed successfully"
                    } catch (Exception e) {
                        echo "Docker deployment failed: ${e.getMessage()}"
                        sh '''
                            echo "Cleaning up failed containers..."
                            docker-compose down || true
                            docker system prune -f || true
                        '''
                        error "Docker deployment failed"
                    }
                }
            }
        }
        
        stage('Monitor Metrics') {
            steps {
                script {
                    echo 'Checking application health and metrics'
                    sh 'curl -f http://192.168.33.10:9091/metrics || echo "Prometheus metrics not available yet"'
                    sh 'curl -f http://192.168.33.10:3001 || echo "Grafana not available yet"'
                    sh 'curl -f http://192.168.33.10:4000/health || echo "Server health check failed"'
                }
            }
        }
    }
    
    post {
        always {
            script {
                def jobName = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def pipelineStatus = currentBuild.result ?: 'SUCCESS'
                def bannerColor = pipelineStatus.toUpperCase() == 'SUCCESS' ? 'green' : 'red'

                def body = """
                    <html>
                    <body>
                    <div style="border: 4px solid ${bannerColor}; padding: 10px;">
                    <h2>${jobName} - Build ${buildNumber}</h2>
                    <div style="background-color: ${bannerColor}; padding: 10px;">
                    <h3 style="color: white;">Pipeline Status: ${pipelineStatus.toUpperCase()}</h3>
                    </div>
                    <p>Images pushed to Nexus: ${env.NEXUS_URL}</p>
                    <p>Check the <a href="${BUILD_URL}">console output</a>.</p>
                    </div>
                    </body>
                    </html>
                """

                emailext (
                    subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus.toUpperCase()}",
                    body: body,
                    to: 'raboudiyoussef@gmail.com',
                    from: 'jenkins@example.com',
                    replyTo: 'jenkins@example.com',
                    mimeType: 'text/html'
                )
            }
        }
        
        success {
            echo 'Pipeline completed successfully!'
        }
        
        failure {
            script {
                echo "Pipeline failed, cleaning up Docker resources..."
                sh '''
                    docker-compose down || true
                    docker system prune -f || true
                '''
            }
        }
    }
}