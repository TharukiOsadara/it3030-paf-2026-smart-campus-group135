package com.smartcampus;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class SmartcampusApplicationTests {

	@Test
	void applicationClassLoads() {
		assertNotNull(new SmartcampusApplication());
	}

}
