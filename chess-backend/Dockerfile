# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends wget stockfish && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r chessgroup && \
    useradd -r -g chessgroup chessuser && \
    wget -O /app/opentelemetry-javaagent.jar https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

COPY --from=build /app/target/*.jar app.jar

RUN chown -R chessuser:chessgroup /app

USER chessuser

ENTRYPOINT ["java", "-javaagent:/app/opentelemetry-javaagent.jar", "-Xmx512m", "-jar", "app.jar"]
