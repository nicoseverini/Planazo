package com.planazo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PlanazoApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlanazoApplication.class, args);
	}

}

