FROM eclipse-temurin:8-jre
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -q

# Use a supported Java 8 Alpine image
FROM eclipse-temurin:8-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV JAVA_OPTS="-Xmx192m -Xss256k -XX:+UseSerialGC"

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx192m", "-Xss256k", "-XX:+UseSerialGC", "-jar", "app.jar"]
