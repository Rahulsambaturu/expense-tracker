package net.SRMAP.expensetrackerApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ExpensetrackerAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpensetrackerAppApplication.class, args);
	}

}
