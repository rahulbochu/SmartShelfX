package backend.dto;

import backend.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private Role role;

    private String phoneNumber;
}