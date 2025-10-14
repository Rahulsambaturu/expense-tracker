# ---------- Build Stage ----------
# Use a working Maven image with Java 8
FROM maven:3.8.6-openjdk-8 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Package the application (skip tests)
RUN mvn clean package -DskipTests

# ---------- Run Stage ----------
# Use lightweight OpenJDK 8 image
FROM openjdk:8-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the built jar file from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the Spring Boot port
EXPOSE 8080

# Set environment variables (Render will override)
ENV SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/yourdbname \
    SPRING_DATASOURCE_USERNAME=root \
    SPRING_DATASOURCE_PASSWORD=yourpassword

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
