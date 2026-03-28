# ===============================
# BUILD STAGE
# ===============================
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ===============================
# RUNTIME STAGE (Ubuntu - full Tesseract support)
# ===============================
FROM eclipse-temurin:17-jdk-jammy

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p /app/uploads/property /app/uploads/ocr

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-XX:+UseContainerSupport","-jar","app.jar"]