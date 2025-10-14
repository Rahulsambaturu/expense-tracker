package net.SRMAP.expensetrackerApp.AuthUtil;
import net.SRMAP.expensetrackerApp.securityConfig.CustomUserDetails;
import net.SRMAP.expensetrackerApp.respositry.UserRepository;
import net.SRMAP.expensetrackerApp.entity.User;
import net.SRMAP.expensetrackerApp.securityConfig.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
@Component
public class AuthUtil {
    @Autowired
    private UserRepository userRepository;


    public Integer getUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getId();  // get ID from CustomUserDetails
        } else if (principal instanceof org.springframework.security.core.userdetails.User) {
            // fallback if using default UserDetails
            String email = ((org.springframework.security.core.userdetails.User) principal).getUsername();
              // fetch user from DB
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElse(null);
        } else {
            return null;
        }
    }
}