# ---------- Build Stage ----------
FROM maven:3.8.6-openjdk-8 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# ---------- Run Stage ----------
FROM openjdk:8-jre-alpine

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render will use PORT environment variable)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]