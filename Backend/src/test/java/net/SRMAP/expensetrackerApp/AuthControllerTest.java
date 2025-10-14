package net.SRMAP.expensetrackerApp;

import net.SRMAP.expensetrackerApp.jwt.JwtUtil;
import net.SRMAP.expensetrackerApp.securityConfig.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    public void login_Success() throws Exception {
        String email = "admin@srmap.edu.in";
        String password = "admin123";
        String token = "jwtToken";

        // Mock user details
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                email, password, Collections.emptyList());

        // Mock CustomUserDetailsService behavior
        Mockito.when(customUserDetailsService.loadUserByUsername(email))
                .thenReturn(userDetails);

        Mockito.when(jwtUtil.generateToken(email))
                .thenReturn(token);

        // Perform POST request
        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string(token));
    }

    @Test
    public void login_Failure() throws Exception {
        String email = "wrong@srmap.edu.in";
        String password = "wrongpass";

        Mockito.doThrow(new BadCredentialsException("Bad Credentials"))
                .when(authenticationManager)
                .authenticate(Mockito.any());

        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Incorrect username and password"));
    }
}
