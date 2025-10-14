FROM maven:3.8.6-openjdk-8 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -q

FROM openjdk:8-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Ultra aggressive memory limits for free tier
ENV JAVA_OPTS="-Xmx192m -Xss256k -XX:+UseSerialGC"

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx192m", "-Xss256k", "-XX:+UseSerialGC", "-jar", "app.jar"]