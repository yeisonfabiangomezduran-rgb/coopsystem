package com.coopsystem.util;

import java.math.BigDecimal;

public final class TestConstants {

    private TestConstants() {
    }

    // IDs
    public static final Long ASSOCIATE_ID = 1L;
    public static final Long SECOND_ASSOCIATE_ID = 2L;
    public static final Long LOAN_ID = 1L;

    // Préstamo
    public static final String LOAN_NUMBER = "200000001";
    public static final BigDecimal LOAN_AMOUNT = new BigDecimal("1000000");
    public static final BigDecimal INTEREST_RATE = new BigDecimal("1.20");
    public static final Integer TERM_MONTHS = 12;

    // Asociado
    public static final String FIRST_NAME = "Juan";
    public static final String LAST_NAME = "Pérez";
    public static final String EMAIL = "juan@test.com";

}