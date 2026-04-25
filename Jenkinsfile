pipeline {
    agent any

    stages {

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '"C:\\Program Files\\sonar-scanner\\bin\\sonar-scanner.bat"'
                }
            }
        }

        stage('Build Docker Containers') {
            steps {
                bat 'docker-compose build'
            }
        }

        stage('Run Containers') {
            steps {
                bat 'docker-compose up -d'
            }
        }

    }
}