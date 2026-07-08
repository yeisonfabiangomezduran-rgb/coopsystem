package com.coopsystem.modules.user.service;

import com.coopsystem.modules.role.entity.Role;
import com.coopsystem.modules.role.repository.RoleRepository;
import com.coopsystem.modules.user.dto.CreateUserRequest;
import com.coopsystem.modules.user.dto.UserResponse;
import com.coopsystem.modules.user.entity.User;
import com.coopsystem.modules.user.repository.UserRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RoleRepository roleRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    public UserResponse create(CreateUserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(
                    "Ya existe un usuario con el nombre: " + request.getUsername()
            );
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(
                    "Ya existe un usuario con el correo: " + request.getEmail()
            );
        }

        // Buscar el rol por defecto
        Role role = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() ->
                        new BusinessException("Rol ROLE_USER no encontrado")
                );

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        user.setRole(role);

        User saved = userRepository.save(user);

        return toResponse(saved);
    }

    private UserResponse toResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getEnabled()
        );
    }
}