#!/bin/bash

echo "🚀 RPG Workout Java Server 시작 중..."

# MongoDB 상태 확인
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB가 실행되지 않았습니다. MongoDB를 시작합니다..."
    
    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mongodb-community
    # Ubuntu/Debian
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start mongodb
    else
        echo "❌ 지원되지 않는 운영체제입니다. MongoDB를 수동으로 시작해주세요."
        exit 1
    fi
    
    echo "⏳ MongoDB 시작 대기 중..."
    sleep 3
fi

echo "✅ MongoDB 실행 중"

# Java 버전 확인
if ! command -v java &> /dev/null; then
    echo "❌ Java가 설치되지 않았습니다. Java 17 이상을 설치해주세요."
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Java 17 이상이 필요합니다. 현재 버전: $JAVA_VERSION"
    exit 1
fi

echo "✅ Java 버전 확인 완료"

# Maven 빌드
echo "🔨 Maven 빌드 중..."
mvn clean install -q

if [ $? -ne 0 ]; then
    echo "❌ Maven 빌드 실패"
    exit 1
fi

echo "✅ 빌드 완료"

# 서버 시작
echo "🌟 서버 시작 중..."
echo "📍 서버 주소: http://localhost:3001"
echo "📖 API 문서: http://localhost:3001/api"
echo "🛑 서버 중지: Ctrl+C"
echo ""

mvn spring-boot:run