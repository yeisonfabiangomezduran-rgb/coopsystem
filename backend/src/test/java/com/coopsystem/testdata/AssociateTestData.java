package com.coopsystem.testdata;

import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.util.ReflectionHelper;
import com.coopsystem.util.TestConstants;

import java.time.LocalDate;

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
        associate.setCode("ASO-0001");
        associate.setDocumentType("CC");
        associate.setDocumentNumber("10000001");
        associate.setBirthDate(LocalDate.of(1990, 1, 1));
        associate.setGender("Masculino");
        associate.setCellphone("3000000001");
        associate.setPhone("6010000001");
        associate.setAddress("Calle 1 # 1-1");
        associate.setCity("Bogotá");
        associate.setDepartment("Cundinamarca");
        associate.setEntryDate(LocalDate.of(2026, 1, 1));
        associate.setType("Persona natural");
        associate.setStatus("Activo");
        associate.setObservations("Asociado de prueba");

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
        associate.setCode("ASO-0002");
        associate.setDocumentType("CC");
        associate.setDocumentNumber("10000002");
        associate.setBirthDate(LocalDate.of(1992, 2, 2));
        associate.setGender("Femenino");
        associate.setCellphone("3000000002");
        associate.setAddress("Calle 2 # 2-2");
        associate.setCity("Medellín");
        associate.setDepartment("Antioquia");
        associate.setEntryDate(LocalDate.of(2026, 2, 2));
        associate.setType("Persona natural");
        associate.setStatus("Activo");

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
