package com.coopsystem.modules.associate.dto;

import java.time.LocalDate;

public class AssociateResponse {
    private final Long id; private final String code; private final String documentType; private final String documentNumber;
    private final String firstName; private final String lastName; private final LocalDate birthDate; private final String gender;
    private final String cellphone; private final String phone; private final String email; private final String address;
    private final String city; private final String department; private final LocalDate entryDate; private final String type;
    private final String status; private final String observations;
    public AssociateResponse(Long id, String code, String documentType, String documentNumber, String firstName, String lastName, LocalDate birthDate, String gender, String cellphone, String phone, String email, String address, String city, String department, LocalDate entryDate, String type, String status, String observations) {
        this.id=id; this.code=code; this.documentType=documentType; this.documentNumber=documentNumber; this.firstName=firstName; this.lastName=lastName; this.birthDate=birthDate; this.gender=gender; this.cellphone=cellphone; this.phone=phone; this.email=email; this.address=address; this.city=city; this.department=department; this.entryDate=entryDate; this.type=type; this.status=status; this.observations=observations;
    }
    public Long getId(){return id;} public String getCode(){return code;} public String getDocumentType(){return documentType;} public String getDocumentNumber(){return documentNumber;} public String getFirstName(){return firstName;} public String getLastName(){return lastName;} public LocalDate getBirthDate(){return birthDate;} public String getGender(){return gender;} public String getCellphone(){return cellphone;} public String getPhone(){return phone;} public String getEmail(){return email;} public String getAddress(){return address;} public String getCity(){return city;} public String getDepartment(){return department;} public LocalDate getEntryDate(){return entryDate;} public String getType(){return type;} public String getStatus(){return status;} public String getObservations(){return observations;}
}
