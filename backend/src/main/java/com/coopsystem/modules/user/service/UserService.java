package com.coopsystem.modules.user.service;

import com.coopsystem.modules.role.entity.Role;
import com.coopsystem.modules.role.repository.RoleRepository;
import com.coopsystem.modules.user.dto.CreateUserRequest;
import com.coopsystem.modules.user.dto.UserResponse;
import com.coopsystem.modules.user.entity.User;
import com.coopsystem.modules.user.repository.UserRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.shared.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

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
        Role role = roleRepository.findByName("USER")
                .orElseThrow(() ->
                        new BusinessException("Rol USER no encontrado")
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

    public List<UserResponse> findAll() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse findById(Long id) {

        return toResponse(findUserById(id));
    }

    public UserResponse update(Long id, CreateUserRequest request) {

        User user = findUserById(id);

        if (userRepository.existsByUsernameAndIdNot(request.getUsername(), id)) {
            throw new BusinessException(
                    "Ya existe un usuario con el nombre: " + request.getUsername()
            );
        }

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new BusinessException(
                    "Ya existe un usuario con el correo: " + request.getEmail()
            );
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return toResponse(userRepository.save(user));
    }

    public void delete(Long id) {

        userRepository.delete(findUserById(id));
    }

    private User findUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con id: " + id
                ));
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
