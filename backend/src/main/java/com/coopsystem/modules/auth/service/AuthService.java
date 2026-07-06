package com.coopsystem.modules.auth.service;

import com.coopsystem.modules.auth.dto.LoginRequest;
import com.coopsystem.modules.auth.dto.LoginResponse;
import com.coopsystem.modules.user.entity.User;
import com.coopsystem.modules.user.repository.UserRepository;
import com.coopsystem.security.JwtService;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(
                        "Usuario o contraseña incorrectos"
                ));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(
                    "Usuario o contraseña incorrectos"
            );
        }

        String token = jwtService.generateToken(user.getUsername());

        return new LoginResponse(
                token,
                "Bearer"
        );
    }
}