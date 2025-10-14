package net.SRMAP.expensetrackerApp.dto.user;

import lombok.Getter;
import lombok.Setter;
import net.SRMAP.expensetrackerApp.entity.Role;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;
@Getter
@Setter
public class userRegisterDto {
    @NotBlank
    private String name;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$")
    private String mobile_number;
    @NotBlank
    private String password;
}
