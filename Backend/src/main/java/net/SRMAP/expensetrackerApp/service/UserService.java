package net.SRMAP.expensetrackerApp.service;
import net.SRMAP.expensetrackerApp.dto.user.userRegisterDto;
import net.SRMAP.expensetrackerApp.dto.user.userResponseDto;
import net.SRMAP.expensetrackerApp.entity.Role;
import net.SRMAP.expensetrackerApp.respositry.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import net.SRMAP.expensetrackerApp.entity.User;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class UserService {
    @Autowired
    private UserRepository etres;
    @Autowired
    private PasswordEncoder pass;
    @Autowired
    private ModelMapper model;
    @CacheEvict(value = {"users", "userEmail"}, allEntries = true)
    public userResponseDto saveentry(userRegisterDto data){
        User get=model.map(data,User.class);
        get.setRole(Role.User);
        get.setPassword(pass.encode(get.getPassword()));
        User saved=etres.save(get);
        return model.map(saved,userResponseDto.class);

    }
    @Cacheable(value = "userEmail", key = "#email")
    public Optional<userResponseDto>getMail(String email){
        return etres.findByEmail(email).map(exp -> model.map(exp, userResponseDto.class));
    }
    @Cacheable(value = "users")
    public List<userResponseDto> getAll(){
        return etres.findAll().stream().map(exp->model.map(exp,userResponseDto.class)).collect(Collectors.toList());
    }
    @Cacheable(value = "userId", key = "#myid")
    public Optional<userResponseDto> getOne(int myid){
        return etres.findById(myid).map(exp->model.map(exp,userResponseDto.class));
    }
    @CacheEvict(value = {"users", "userId", "userEmail"}, allEntries = true)
    public void deletebyid(int myid){
        etres.deleteById(myid);
    }
    @CachePut(value = "userId", key = "#id")
    public userResponseDto updateentry(int id ,userRegisterDto data){
        User existing = etres.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(data.getName() != null && !data.getName().isEmpty()) existing.setName(data.getName());
        if(data.getEmail() != null && !data.getEmail().isEmpty()) existing.setEmail(data.getEmail());
        if(data.getPassword()!=null &&!data.getPassword().isEmpty() ){
            existing.setPassword(pass.encode(data.getPassword()));
        }
        if(data.getMobile_number()!=null&&!data.getMobile_number().isEmpty()){
            existing.setMobile_number(data.getMobile_number());
        }
        // Add other fields as necessary

        User saved = etres.save(existing);
        return model.map(saved, userResponseDto.class);
    }
    @CacheEvict(value = {"users", "userId", "userEmail"}, allEntries = true)
    public void deleteByEmail(String email) {
        User user = etres.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        etres.delete(user);
    }


}
