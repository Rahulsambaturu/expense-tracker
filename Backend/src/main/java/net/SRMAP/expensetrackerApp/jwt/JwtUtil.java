package net.SRMAP.expensetrackerApp.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private String SECRET_KEY="uF3r9Z6mT8xQ2vY5LwH1jK8pVmR0sXcAqNfLb7oPz4U=";
    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }
    public String generateToken(String username ){
        Map<String,Object> claims=new HashMap<>();
        return createToken(claims,username);
    }
    public String exctractUsername(String token){
        Claims claims=extractAllClaims(token);
        return claims.getSubject();
    }
    public int extractUserId(String token){
        Claims claims=extractAllClaims(token);
        return (int)claims.get("UserId");
    }
    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }
    public Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public Boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }
    public String createToken(Map<String,Object>claims,String username) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .header().empty().add("typ","JWT")
                .and()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 5)) // 5 minutes
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token) {
        return !isTokenExpired(token);
    }
}
