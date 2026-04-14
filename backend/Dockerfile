FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /home/app
COPY pom.xml pom.xml
RUN mvn dependency:go-offline
COPY . .
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre AS deploy
WORKDIR /home/app
COPY --from=build /home/app/target/planazo-0.0.1-SNAPSHOT.jar /home/app/planazo-0.0.1-SNAPSHOT.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/home/app/planazo-0.0.1-SNAPSHOT.jar"]
