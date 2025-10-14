package net.SRMAP.expensetrackerApp.controllers;

import net.SRMAP.expensetrackerApp.dto.category.CategoryCreateDto;
import net.SRMAP.expensetrackerApp.dto.category.categoryResponseDto;
import net.SRMAP.expensetrackerApp.entity.Category;
import net.SRMAP.expensetrackerApp.service.CategoryService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
@RestController
@RequestMapping("/category")
public class CategoryController {
    @Autowired
    private CategoryService category;

    @GetMapping
    public ResponseEntity<List<categoryResponseDto>> getAll(){

        return new ResponseEntity<>(category.findAll(), HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getbyid(@PathVariable int id){
        Optional<categoryResponseDto>get=category.findbyId(id);
        if(get.isPresent()){
            return new ResponseEntity<>(get.get(),HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    @PostMapping
    public ResponseEntity<?>Save(@RequestBody CategoryCreateDto data){
        try{
            return new ResponseEntity<>(category.Save(data),HttpStatus.CREATED);
        }
        catch(Exception e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody CategoryCreateDto dto){
        try {
            categoryResponseDto updated = category.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

}
