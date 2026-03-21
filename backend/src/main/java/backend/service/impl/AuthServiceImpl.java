package backend.service.impl;

import backend.dto.LoginRequest;
import backend.dto.RegisterRequest;
import backend.entity.User;
import backend.enums.Role;
import backend.repository.UserRepository;
import backend.security.JwtUtil;
import backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email '" + request.getEmail() + "' is already registered.");
        }

        User user = new User();
        user.setUsername(request.getUsername());        
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);
        user.setPhoneNumber(request.getPhoneNumber());  
        user.setIsActive(true);

        userRepository.save(user);
        return "User registered successfully!";
    }

    @Override
    @Transactional(readOnly = true)
    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Account is deactivated. Please contact an administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}