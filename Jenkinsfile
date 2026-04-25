pipeline {
    agent any

    environment {
        MONGODB_URL = credentials('mongodb-url')
        DATABASE_NAME = credentials('database-name')
        GROQ_API_KEY = credentials('groq-api-key')
        JWT_SECRET_KEY = credentials('jwt-secret')
        VITE_API_BASE_URL = credentials('vite-api-url')
    }

    stages {

        stage('Create Env Files') {
            steps {

                sh '''
                echo "APP_NAME=Debate Assistant AI" > backend/.env
                echo "DEBUG=True" >> backend/.env
                echo "MONGODB_URL=$MONGODB_URL" >> backend/.env
                echo "DATABASE_NAME=$DATABASE_NAME" >> backend/.env
                echo "GROQ_API_KEY=$GROQ_API_KEY" >> backend/.env
                echo "JWT_SECRET_KEY=$JWT_SECRET_KEY" >> backend/.env
                echo "JWT_ALGORITHM=HS256" >> backend/.env
                echo "ACCESS_TOKEN_EXPIRE_MINUTES=30" >> backend/.env
                '''

                sh '''
                echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > frontend/.env
                '''
            }
        }

        stage('Build Docker Containers') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }

    }
}