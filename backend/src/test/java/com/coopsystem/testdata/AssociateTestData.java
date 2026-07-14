package com.coopsystem.testdata;

import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.util.ReflectionHelper;
import com.coopsystem.util.TestConstants;

public final class AssociateTestData {

    private AssociateTestData() {
    }

    /**
     * Asociado válido para pruebas.
     */
    public static Associate validAssociate() {

        Associate associate = new Associate();

        ReflectionHelper.setId(
                associate,
                TestConstants.ASSOCIATE_ID);

        associate.setFirstName("Juan");
        associate.setLastName("Pérez");
        associate.setEmail("juan@test.com");

        return associate;
    }

    /**
     * Otro asociado para pruebas.
     */
    public static Associate secondAssociate() {

        Associate associate = new Associate();

        ReflectionHelper.setId(
                associate,
                2L);

        associate.setFirstName("María");
        associate.setLastName("Gómez");
        associate.setEmail("maria@test.com");

        return associate;
    }

    /**
     * Asociado sin correo.
     */
    public static Associate associateWithoutEmail() {

        Associate associate = new Associate();

        ReflectionHelper.setId(
                associate,
                3L);

        associate.setFirstName("Carlos");
        associate.setLastName("Ramírez");

        return associate;
    }
}