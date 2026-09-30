package com.coopsystem.modules.associate.service;

import com.coopsystem.modules.associate.dto.*;
import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssociateService {

    private final AssociateRepository associateRepository;

    public AssociateService(AssociateRepository associateRepository) {
        this.associateRepository = associateRepository;
    }

    public List<AssociateResponse> findAll() {
        return associateRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AssociateResponse> search(String query, int limit) {

        String normalizedQuery = query == null ? "" : query.trim();

        if (normalizedQuery.length() < 2) {
            return List.of();
        }

        int safeLimit = Math.min(Math.max(limit, 1), 10);

        return associateRepository
                .searchByText(
                        normalizedQuery,
                        PageRequest.of(0, safeLimit)
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AssociateResponse findById(Long id) {
        return toResponse(findAssociate(id));
    }

    public AssociateResponse create(CreateAssociateRequest request) {

        validateUnique(request, null);

        Associate associate = new Associate();

        applyRequest(associate, request);

        // El código NO lo envía el frontend
        associate.setCode(null);

        // Primer guardado para obtener el ID
        associate = associateRepository.save(associate);

        // Generar código automáticamente
        associate.setCode(String.format("ASO-%04d", associate.getId()));

        // Guardar nuevamente
        associate = associateRepository.save(associate);

        return toResponse(associate);
    }

    public AssociateResponse update(Long id, UpdateAssociateRequest request) {

        Associate associate = findAssociate(id);

        validateUnique(request, id);

        applyRequest(associate, request);

        // Mantener el código existente
        associate.setCode(associate.getCode());

        return toResponse(associateRepository.save(associate));
    }

    public void delete(Long id) {
        associateRepository.delete(findAssociate(id));
    }

    private Associate findAssociate(Long id) {
        return associateRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No existe un asociado con id: " + id
                        ));
    }

    private void validateUnique(CreateAssociateRequest request, Long id) {

        boolean duplicateDocument =
                id == null
                        ? associateRepository.existsByDocumentNumber(
                                request.getDocumentNumber())
                        : associateRepository.existsByDocumentNumberAndIdNot(
                                request.getDocumentNumber(),
                                id);

        if (duplicateDocument) {
            throw new BusinessException(
                    "Ya existe un asociado con el documento: "
                            + request.getDocumentNumber()
            );
        }

        boolean duplicateEmail =
                id == null
                        ? associateRepository.existsByEmail(
                                request.getEmail())
                        : associateRepository.existsByEmailAndIdNot(
                                request.getEmail(),
                                id);

        if (duplicateEmail) {
            throw new BusinessException(
                    "Ya existe un asociado con el correo: "
                            + request.getEmail()
            );
        }
    }

    private void applyRequest(Associate a, CreateAssociateRequest r) {

        a.setDocumentType(r.getDocumentType());
        a.setDocumentNumber(r.getDocumentNumber());
        a.setFirstName(r.getFirstName());
        a.setLastName(r.getLastName());
        a.setBirthDate(r.getBirthDate());
        a.setGender(r.getGender());
        a.setCellphone(r.getCellphone());
        a.setPhone(r.getPhone());
        a.setEmail(r.getEmail());
        a.setAddress(r.getAddress());
        a.setCity(r.getCity());
        a.setDepartment(r.getDepartment());
        a.setEntryDate(r.getEntryDate());
        a.setType(r.getType());
        a.setStatus(r.getStatus());
        a.setObservations(r.getObservations());
    }

    private AssociateResponse toResponse(Associate a) {

        return new AssociateResponse(
                a.getId(),
                a.getCode(),
                a.getDocumentType(),
                a.getDocumentNumber(),
                a.getFirstName(),
                a.getLastName(),
                a.getBirthDate(),
                a.getGender(),
                a.getCellphone(),
                a.getPhone(),
                a.getEmail(),
                a.getAddress(),
                a.getCity(),
                a.getDepartment(),
                a.getEntryDate(),
                a.getType(),
                a.getStatus(),
                a.getObservations()
        );
    }
}