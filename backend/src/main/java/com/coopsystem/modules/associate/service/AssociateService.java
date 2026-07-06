package com.coopsystem.modules.associate.service;

import com.coopsystem.modules.associate.dto.AssociateResponse;
import com.coopsystem.modules.associate.dto.CreateAssociateRequest;
import com.coopsystem.modules.associate.dto.UpdateAssociateRequest;
import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.shared.exception.ResourceNotFoundException;
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

    public AssociateResponse findById(Long id) {

        Associate associate = associateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un asociado con id: " + id
                ));

        return new AssociateResponse(
                associate.getId(),
                associate.getFirstName(),
                associate.getLastName(),
                associate.getEmail()
        );
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

    public AssociateResponse update(Long id, UpdateAssociateRequest request) {

        Associate associate = associateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un asociado con id: " + id
                ));

        if (associateRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new BusinessException(
                    "Ya existe un asociado con el correo: " + request.getEmail()
            );
        }

        associate.setFirstName(request.getFirstName());
        associate.setLastName(request.getLastName());
        associate.setEmail(request.getEmail());

        Associate updated = associateRepository.save(associate);

        return new AssociateResponse(
                updated.getId(),
                updated.getFirstName(),
                updated.getLastName(),
                updated.getEmail()
        );
    }
}