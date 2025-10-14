package net.SRMAP.expensetrackerApp.service;

import net.SRMAP.expensetrackerApp.dto.category.CategoryCreateDto;
import net.SRMAP.expensetrackerApp.dto.category.categoryResponseDto;
import net.SRMAP.expensetrackerApp.entity.Category;
import net.SRMAP.expensetrackerApp.respositry.CategoryRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository category;
    @Autowired
    private ModelMapper model;
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public categoryResponseDto Save(CategoryCreateDto data){
        Category get= model.map(data, Category.class);
        Category saved=category.save(get);
        return model.map(saved,categoryResponseDto.class);
    }
    @Cacheable(value="category",key="#id")
    public Optional<categoryResponseDto> findbyId(int id){
        return category.findById(id).map(exp->model.map(exp, categoryResponseDto.class));
    }
    @Cacheable(value="categories")
    public List<categoryResponseDto> findAll(){
        return category.findAll().stream().map(exp->model.map(exp, categoryResponseDto.class)).collect(Collectors.toList());
    }
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public categoryResponseDto update(int id, CategoryCreateDto dto){
        Category existing = category.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if(dto.getName() != null && !dto.getName().isEmpty()) existing.setName(dto.getName());
        if(dto.getDescription() != null && !dto.getDescription().isEmpty()) existing.setDescription(dto.getDescription());

        Category saved = category.save(existing);
        return model.map(saved, categoryResponseDto.class);
    }


}
