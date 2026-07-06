package com.coopsystem.modules.associate.service;

import com.coopsystem.modules.associate.dto.AssociateResponse;
import com.coopsystem.modules.associate.dto.CreateAssociateRequest;
import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssociateService {

    private final AssociateRepository associateRepository;

    public AssociateService(AssociateRepository associateRepository) {
        this.associateRepository = associateRepository;
    }

    public List<Associate> findAll() {
        return associateRepository.findAll();
    }

    public AssociateResponse create(CreateAssociateRequest request) {

        if (associateRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(
                    "Ya existe un asociado con el correo: " + request.getEmail()
            );
        }

        Associate associate = new Associate();

        associate.setFirstName(request.getFirstName());
        associate.setLastName(request.getLastName());
        associate.setEmail(request.getEmail());

        Associate saved = associateRepository.save(associate);

        return new AssociateResponse(
                saved.getId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail()
        );
    }
}