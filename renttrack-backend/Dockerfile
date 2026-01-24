# ===============================
# BUILD STAGE
# ===============================
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# copy pom first for dependency caching
COPY pom.xml .

# download dependencies (faster CI builds)
RUN mvn dependency:go-offline

# copy source code
COPY src ./src

# build jar
RUN mvn clean package -DskipTests


# ===============================
# RUNTIME STAGE
# ===============================
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# expose spring boot port
EXPOSE 8080

# recommended JVM flags for docker
ENTRYPOINT ["java","-XX:+UseContainerSupport","-jar","app.jar"]
