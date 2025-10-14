package net.SRMAP.expensetrackerApp.controllers;
import lombok.extern.slf4j.Slf4j;
import net.SRMAP.expensetrackerApp.AuthUtil.AuthUtil;
import net.SRMAP.expensetrackerApp.dto.user.userLoginDto;
import net.SRMAP.expensetrackerApp.dto.user.userRegisterDto;
import net.SRMAP.expensetrackerApp.dto.user.userResponseDto;
import net.SRMAP.expensetrackerApp.entity.User;
import net.SRMAP.expensetrackerApp.jwt.JwtUtil;
import net.SRMAP.expensetrackerApp.securityConfig.CustomUserDetailsService;
import net.SRMAP.expensetrackerApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
//@Slf4j
@RestController
@RequestMapping("/users")

public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    @Autowired
    private UserService uds;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthUtil authUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @GetMapping("/admin")
    public ResponseEntity<List<userResponseDto>> getAll(){

        return new ResponseEntity<>(uds.getAll(),HttpStatus.OK);
    }
    @GetMapping("/me")
    public ResponseEntity<?>getuserbythereId(Authentication authentication){
        String email=authentication.getName();
        Optional<userResponseDto> user = uds.getMail(email);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    @GetMapping("/admin/{myid}")
    public ResponseEntity<?> getone(@PathVariable int myid){
        Optional<userResponseDto> entry=uds.getOne(myid);
        if(entry.isPresent()){
            return new ResponseEntity<>(entry.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/Signup")
    public ResponseEntity<?> Singup(@RequestBody userRegisterDto myentry) {
        logger.info("Received signup request for email: {}", myentry.getEmail());
        try {
            userResponseDto get = uds.saveentry(myentry);
            logger.info("User registered successfully: {}", myentry.getEmail());
            return new ResponseEntity<>(get, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            logger.error("Duplicate email or constraint violation: {}", e.getMessage());
            return new ResponseEntity<>("User with this email already exists", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Registration error: {}", e.getMessage(), e);
            return new ResponseEntity<>("Registration failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/Login")
    public ResponseEntity<?> login(@RequestBody userLoginDto myentry){
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(myentry.getEmail(),myentry.getPassword()));
            UserDetails user= customUserDetailsService.loadUserByUsername(myentry.getEmail());
            String jwt= jwtUtil.generateToken(user.getUsername());
            return new ResponseEntity<>(jwt,HttpStatus.OK);
        }
        catch(Exception e){
            return new ResponseEntity<>("Incorrect username and password",HttpStatus.BAD_REQUEST);
        }

    }
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody userRegisterDto dto){
        int id=authUtil.getUserId();
        try {
            userResponseDto updated = uds.updateentry(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMe(Authentication authentication){
        String email = authentication.getName();
        try {
            uds.deleteByEmail(email);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteUserId(@PathVariable int id){

        try {
            uds.deletebyid(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

}
