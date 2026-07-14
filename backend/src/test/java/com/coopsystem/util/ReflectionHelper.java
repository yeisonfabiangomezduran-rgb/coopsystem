package com.coopsystem.util;

import org.springframework.test.util.ReflectionTestUtils;

public final class ReflectionHelper {

    private ReflectionHelper() {
    }

    public static void setId(Object entity, Long id) {

        ReflectionTestUtils.setField(
                entity,
                "id",
                id);
    }

}