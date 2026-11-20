package com.controlpark;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ControlparkApplication {

	public static void main(String[] args) {
		SpringApplication.run(ControlparkApplication.class, args);
	}

}
