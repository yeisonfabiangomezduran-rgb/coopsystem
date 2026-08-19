package com.coopsystem.modules.associate.service;

import com.coopsystem.modules.associate.dto.AssociateResponse;
import com.coopsystem.modules.associate.dto.CreateAssociateRequest;
import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.shared.exception.ResourceNotFoundException;
import com.coopsystem.testdata.AssociateTestData;
import com.coopsystem.util.ReflectionHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.coopsystem.modules.associate.dto.UpdateAssociateRequest;
import static org.mockito.ArgumentMatchers.any;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssociateServiceTest {

    @Mock
    private AssociateRepository associateRepository;

    @InjectMocks
    private AssociateService associateService;

    @Test
    void shouldFindAllAssociatesSuccessfully() {

        when(associateRepository.findAll())
                .thenReturn(List.of(
                        AssociateTestData.validAssociate(),
                        AssociateTestData.secondAssociate()));

        List<AssociateResponse> response =
                associateService.findAll();

        assertEquals(2, response.size());

        assertEquals(
                "Juan",
                response.get(0).getFirstName());

        verify(associateRepository)
                .findAll();

        verifyNoMoreInteractions(
                associateRepository);
    }

    @Test
    void shouldFindAssociateByIdSuccessfully() {

        Associate associate =
                AssociateTestData.validAssociate();

        when(associateRepository.findById(1L))
                .thenReturn(Optional.of(associate));

        AssociateResponse response =
                associateService.findById(1L);

        assertEquals(
                "Juan",
                response.getFirstName());

        assertEquals(
                "Pérez",
                response.getLastName());

        assertEquals(
                "juan@test.com",
                response.getEmail());

        assertEquals(
                "ASO-0001",
                response.getCode());

        assertEquals(
                "10000001",
                response.getDocumentNumber());

        verify(associateRepository)
                .findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenAssociateDoesNotExist() {

        when(associateRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> associateService.findById(1L));

        verify(associateRepository)
                .findById(1L);
    }

    @Test
    void shouldCreateAssociateSuccessfully() {

        CreateAssociateRequest request =
                new CreateAssociateRequest();

        request.setFirstName("Juan");
        request.setLastName("Pérez");
        request.setEmail("juan@test.com");

        when(associateRepository.existsByEmail(
                request.getEmail()))
                .thenReturn(false);

        Associate associate =
                new Associate();

        ReflectionHelper.setId(
                associate,
                1L);

        associate.setFirstName(
                request.getFirstName());

        associate.setLastName(
                request.getLastName());

        associate.setEmail(
                request.getEmail());

        when(associateRepository.save(any()))
                .thenReturn(associate);

        AssociateResponse response =
                associateService.create(request);

        assertEquals(
                "Juan",
                response.getFirstName());

        ArgumentCaptor<Associate> captor =
                ArgumentCaptor.forClass(
                        Associate.class);

        verify(associateRepository)
                .save(captor.capture());

        assertEquals(
                "Juan",
                captor.getValue().getFirstName());
    }

        @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        CreateAssociateRequest request =
                new CreateAssociateRequest();

        request.setFirstName("Juan");
        request.setLastName("Pérez");
        request.setEmail("juan@test.com");

        when(associateRepository.existsByEmail(
                request.getEmail()))
                .thenReturn(true);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> associateService.create(request));

        assertEquals(
                "Ya existe un asociado con el correo: juan@test.com",
                exception.getMessage());

        verify(associateRepository)
                .existsByEmail("juan@test.com");

        verify(associateRepository, never())
                .save(any());
    }

    @Test
    void shouldUpdateAssociateSuccessfully() {

        Associate associate =
                AssociateTestData.validAssociate();

        UpdateAssociateRequest request =
                new UpdateAssociateRequest();

        request.setFirstName("Carlos");
        request.setLastName("Ramírez");
        request.setEmail("carlos@test.com");

        when(associateRepository.findById(1L))
                .thenReturn(Optional.of(associate));

        when(associateRepository.existsByEmailAndIdNot(
                request.getEmail(),
                1L))
                .thenReturn(false);

        when(associateRepository.save(any(Associate.class)))
                .thenReturn(associate);

        AssociateResponse response =
                associateService.update(
                        1L,
                        request);

        assertNotNull(response);

        verify(associateRepository)
                .save(any(Associate.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingAssociate() {

        UpdateAssociateRequest request =
                new UpdateAssociateRequest();

        request.setFirstName("Carlos");
        request.setLastName("Ramírez");
        request.setEmail("carlos@test.com");

        when(associateRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> associateService.update(
                        1L,
                        request));

        verify(associateRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowExceptionWhenUpdatingWithDuplicateEmail() {

        Associate associate =
                AssociateTestData.validAssociate();

        UpdateAssociateRequest request =
                new UpdateAssociateRequest();

        request.setFirstName("Carlos");
        request.setLastName("Ramírez");
        request.setEmail("maria@test.com");

        when(associateRepository.findById(1L))
                .thenReturn(Optional.of(associate));

        when(associateRepository.existsByEmailAndIdNot(
                request.getEmail(),
                1L))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> associateService.update(
                        1L,
                        request));

        verify(associateRepository, never())
                .save(any());
    }

    @Test
    void shouldDeleteAssociateSuccessfully() {

        Associate associate =
                AssociateTestData.validAssociate();

        when(associateRepository.findById(1L))
                .thenReturn(Optional.of(associate));

        associateService.delete(1L);

        verify(associateRepository)
                .delete(associate);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistingAssociate() {

        when(associateRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> associateService.delete(1L));

        verify(associateRepository, never())
                .delete(any());
    }

}
