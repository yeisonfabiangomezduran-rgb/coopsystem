package com.coopsystem.modules.auth.service;

import com.coopsystem.modules.auth.dto.LoginRequest;
import com.coopsystem.modules.auth.dto.LoginResponse;
import com.coopsystem.modules.user.entity.User;
import com.coopsystem.modules.user.repository.UserRepository;
import com.coopsystem.security.JwtService;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.util.ReflectionHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldLoginSuccessfully() {

        LoginRequest request = new LoginRequest();

        request.setUsername("admin");
        request.setPassword("123456");

        User user = new User();

        ReflectionHelper.setId(user, 1L);

        user.setUsername("admin");
        user.setPassword("$2a$10$password");

        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "123456",
                "$2a$10$password"))
                .thenReturn(true);

        when(jwtService.generateToken("admin"))
                .thenReturn("jwt-token");

        LoginResponse response =
                authService.login(request);

        assertNotNull(response);

        assertEquals(
                "jwt-token",
                response.getToken());

        assertEquals(
                "Bearer",
                response.getType());

        verify(userRepository)
                .findByUsername("admin");

        verify(passwordEncoder)
                .matches(
                        "123456",
                        "$2a$10$password");

        verify(jwtService)
                .generateToken("admin");
    }

    @Test
    void shouldThrowExceptionWhenUserDoesNotExist() {

        LoginRequest request = new LoginRequest();

        request.setUsername("admin");
        request.setPassword("123456");

        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> authService.login(request));

        assertEquals(
                "Usuario o contraseña incorrectos",
                exception.getMessage());

        verify(userRepository)
                .findByUsername("admin");

        verifyNoInteractions(
                passwordEncoder,
                jwtService);
    }

        @Test
    void shouldThrowExceptionWhenPasswordIsIncorrect() {

        LoginRequest request = new LoginRequest();

        request.setUsername("admin");
        request.setPassword("123456");

        User user = new User();

        ReflectionHelper.setId(user, 1L);

        user.setUsername("admin");
        user.setPassword("$2a$10$password");

        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "123456",
                "$2a$10$password"))
                .thenReturn(false);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> authService.login(request));

        assertEquals(
                "Usuario o contraseña incorrectos",
                exception.getMessage());

        verify(userRepository)
                .findByUsername("admin");

        verify(passwordEncoder)
                .matches(
                        "123456",
                        "$2a$10$password");

        verifyNoInteractions(jwtService);
    }

}