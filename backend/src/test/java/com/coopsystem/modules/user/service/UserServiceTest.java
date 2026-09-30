package com.coopsystem.modules.user.service;

import com.coopsystem.modules.role.entity.Role;
import com.coopsystem.modules.role.repository.RoleRepository;
import com.coopsystem.modules.user.dto.CreateUserRequest;
import com.coopsystem.modules.user.dto.UserResponse;
import com.coopsystem.modules.user.entity.User;
import com.coopsystem.modules.user.repository.UserRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.util.ReflectionHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUserSuccessfully() {

        CreateUserRequest request = new CreateUserRequest();

        request.setUsername("admin");
        request.setEmail("admin@test.com");
        request.setPassword("Password123");

        Role role = new Role(1L, "ROLE_USER");

        when(userRepository.existsByUsername("admin"))
                .thenReturn(false);

        when(userRepository.existsByEmail("admin@test.com"))
                .thenReturn(false);

        when(roleRepository.findByName("USER"))
                .thenReturn(Optional.of(role));

        when(passwordEncoder.encode("Password123"))
                .thenReturn("encoded-password");

        User saved = new User();

        ReflectionHelper.setId(saved, 1L);

        saved.setUsername("admin");
        saved.setEmail("admin@test.com");
        saved.setPassword("encoded-password");
        saved.setEnabled(true);
        saved.setRole(role);

        when(userRepository.save(any(User.class)))
                .thenReturn(saved);

        UserResponse response =
                userService.create(request);

        assertNotNull(response);

        assertEquals(
                "admin",
                response.getUsername());

        assertEquals(
                "admin@test.com",
                response.getEmail());

        assertTrue(response.getEnabled());

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository)
                .save(captor.capture());

        assertEquals(
                "encoded-password",
                captor.getValue().getPassword());

        assertEquals(
                "ROLE_USER",
                captor.getValue().getRole().getName());
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {

        CreateUserRequest request = new CreateUserRequest();

        request.setUsername("admin");

        when(userRepository.existsByUsername("admin"))
                .thenReturn(true);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> userService.create(request));

        assertEquals(
                "Ya existe un usuario con el nombre: admin",
                exception.getMessage());

        verify(userRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        CreateUserRequest request = new CreateUserRequest();

        request.setUsername("admin");
        request.setEmail("admin@test.com");
        request.setPassword("Password123");

        when(userRepository.existsByUsername("admin"))
                .thenReturn(false);

        when(userRepository.existsByEmail("admin@test.com"))
                .thenReturn(true);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> userService.create(request));

        assertEquals(
                "Ya existe un usuario con el correo: admin@test.com",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenDefaultRoleDoesNotExist() {

        CreateUserRequest request = new CreateUserRequest();

        request.setUsername("admin");
        request.setEmail("admin@test.com");
        request.setPassword("Password123");

        when(userRepository.existsByUsername("admin"))
                .thenReturn(false);

        when(userRepository.existsByEmail("admin@test.com"))
                .thenReturn(false);

        when(roleRepository.findByName("USER"))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> userService.create(request));

        assertEquals(
                "Rol USER no encontrado",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));

        verify(passwordEncoder, never())
                .encode(anyString());
    }
}