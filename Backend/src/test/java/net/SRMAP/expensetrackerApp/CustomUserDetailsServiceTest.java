package net.SRMAP.expensetrackerApp;
import net.SRMAP.expensetrackerApp.securityConfig.CustomUserDetailsService;
import net.SRMAP.expensetrackerApp.entity.Role;
import net.SRMAP.expensetrackerApp.entity.User;
import net.SRMAP.expensetrackerApp.respositry.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void loadUserByUsername_ShouldReturnUserDetails_WhenUserExists() {
        // Arrange
        String email = "admin@srmap.edu.in";
        User user = new User();
        user.setEmail(email);
        user.setPassword("$2a$10$dummyhashedpassword"); // BCrypt hash
        user.setRole(Role.User);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        // Assert
        assertNotNull(userDetails);
        assertEquals(email, userDetails.getUsername());
        assertEquals(user.getPassword(), userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_User")));
    }

    @Test
    void loadUserByUsername_ShouldThrowException_WhenUserDoesNotExist() {
        // Arrange
        String email = "nonexistent@srmap.edu.in";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername(email));
    }
}
