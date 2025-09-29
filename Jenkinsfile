pipeline {
    agent any
    
    tools {
        nodejs "node-22" 
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
                        rm -rf node_modules package-lock.json
                        npm config set strict-ssl false
                        npm install --legacy-peer-deps --no-audit
                    '''
                    echo "Server dependencies installed successfully"
                }
                dir('client') {
                    sh '''
                        rm -rf node_modules package-lock.json
                        npm config set strict-ssl false
                        npm install --legacy-peer-deps --no-audit
                        npm install emoji-mart @emoji-mart/data @emoji-mart/react --legacy-peer-deps
                    '''
                    echo "Client dependencies installed successfully"
                }
            }
        }
        
        stage('Build') {
            environment {
                NODE_OPTIONS = "--max_old_space_size=4096"
            }
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
     
        stage('Generate coverage screenshot') {
            steps {
                sh '''
                    wkhtmltoimage --enable-local-file-access \
                    server/coverage/lcov-report/index.html \
                    server/coverage/coverage.png
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('server') {
                    sh "npx sonar-scanner -Dsonar.token=sqa_5be78e656a0f1e7e6f779f48e978dc0c72c9a988"
                    echo "SonarQube analysis completed"
                }
            }
        }
        
        stage('Build and Deploy with Docker') {
            steps {
                script {
                    try {
                        echo 'Building and deploying with Docker Compose...'
                        sh 'docker-compose down || true'
                        sh 'docker-compose up --build -d'
                        echo "Docker deployment completed successfully"
                    } catch (Exception e) {
                        echo "Docker build failed: ${e.getMessage()}"
                        sh '''
                            echo "Cleaning up failed containers and images..."
                            docker-compose down || true
                            docker system prune -f || true
                            docker image prune -f || true
                        '''
                        error "Docker build failed, containers cleaned up"
                    }
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    try {
                        echo 'Pushing Docker image to repository...'
                        withCredentials([usernamePassword(credentialsId: 'ea679d47-ad2a-4837-9028-a0cd56afd50b', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                            sh 'docker login -u $DOCKER_USER -p $DOCKER_PASSWORD'
                            
                            // Tag and push server image
                            sh 'docker tag maps_server youssefraboudi/pentabell-maps-server:latest'
                            sh 'docker push youssefraboudi/pentabell-maps-server:latest'
                            
                            // Tag and push client image
                            sh 'docker tag maps_client youssefraboudi/pentabell-maps-client:latest'
                            sh 'docker push youssefraboudi/pentabell-maps-client:latest'
                            
                            // Cleanup local tagged images
                            sh 'docker rmi youssefraboudi/pentabell-maps-server:latest || true'
                            sh 'docker rmi youssefraboudi/pentabell-maps-client:latest || true'
                            echo "Docker image pushed successfully"
                        }
                    } catch (Exception e) {
                        echo "Docker push failed: ${e.getMessage()}"
                        sh '''
                            echo "Cleaning up after failed push..."
                            docker system prune -f || true
                        '''
                        error "Docker push failed, cleaned up"
                    }
                }
            }
        }
        
        stage('Monitor Metrics') {
            steps {
                script {
                    echo 'Checking application health and metrics...'
                    sh 'curl -f http://192.168.33.10:9091/metrics || echo "Prometheus metrics not available yet"'
                    sh 'curl -f http://192.168.33.10:3001 || echo "Grafana not available yet"'
                    sh 'curl -f http://192.168.33.10:4000/health || echo "Server health check failed"'
                    sh 'curl -f http://192.168.33.10:4040 || echo "Ngrok interface not available yet"'
                }
            }
        }

        stage('Get Ngrok URLs') {
            steps {
                script {
                    echo 'Retrieving ngrok public URLs...'
                    sh '''
                        sleep 5
                        echo "Ngrok tunnels:"
                        curl -s http://192.168.33.10:4040/api/tunnels || echo "Ngrok API not ready"
                    '''
                }
            }
        }
    }
    
    post {
        failure {
            script {
                echo "Pipeline failed, cleaning up Docker resources..."
                sh '''
                    docker-compose down || true
                    docker system prune -f || true
                    docker image prune -f || true
                    docker container prune -f || true
                '''
            }
        }
        
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
                    <p>Check the <a href="${BUILD_URL}">console output</a>.</p>
                    <p>Voici le résultat de la couverture de tests pour le build <b>${buildNumber}</b> :</p>
                    <img src="cid:coverage.png" alt="Coverage Report" style="max-width:100%; border:1px solid #ccc;"/>
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
                    mimeType: 'text/html',
                    attachmentsPattern: 'server/coverage/coverage.png'
                )
            }
        }
        
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}