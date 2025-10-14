//package net.SRMAP.expensetrackerApp.securityConfiguration;
//package net.SRMAP.expensetrackerApp.jwt.;
package net.SRMAP.expensetrackerApp.securityConfig;

import net.SRMAP.expensetrackerApp.entity.User;
import net.SRMAP.expensetrackerApp.respositry.UserRepository;
import org.omg.CORBA.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository user;

    public UserDetails loadUserByUsername(String email)throws UsernameNotFoundException{
        User data=user.findByEmail(email).orElseThrow(()->new UsernameNotFoundException("user not found"));
        GrantedAuthority authority=new SimpleGrantedAuthority("ROLE_" + data.getRole().name());
        return new org.springframework.security.core.userdetails.User(data.getEmail(), data.getPassword(), Collections.singleton(authority) );
    }
}
