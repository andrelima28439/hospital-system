FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S hospital && adduser -S hospital -G hospital
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads /app/logs && chown -R hospital:hospital /app
USER hospital
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
