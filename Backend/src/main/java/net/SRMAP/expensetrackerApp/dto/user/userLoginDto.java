package net.SRMAP.expensetrackerApp.dto.user;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Getter
@Setter
public class userLoginDto {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String password;
}
