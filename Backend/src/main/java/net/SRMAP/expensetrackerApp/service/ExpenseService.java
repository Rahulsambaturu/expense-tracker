package net.SRMAP.expensetrackerApp.service;
import net.SRMAP.expensetrackerApp.dto.Expenses.ExpenseCreateDto;
import net.SRMAP.expensetrackerApp.dto.Expenses.ExpenseResponseDto;
import net.SRMAP.expensetrackerApp.entity.Category;
import net.SRMAP.expensetrackerApp.entity.Expenses;
import net.SRMAP.expensetrackerApp.entity.User;
import net.SRMAP.expensetrackerApp.respositry.CategoryRepository;
import net.SRMAP.expensetrackerApp.respositry.ExpenseRepository;
import net.SRMAP.expensetrackerApp.respositry.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenses;
    @Autowired
    private ModelMapper model;
    @CacheEvict(value = {"userExpenses", "userExpensesByCategory"}, allEntries = true)
    public ExpenseResponseDto Save(ExpenseCreateDto dto) {
        Expenses expense = new Expenses();

        expense.setAmount(dto.getAmount());
        expense.setExpenseDescription(dto.getExpenseDescription());
        expense.setPaymentMethod(dto.getPaymentMethod());

        // ✅ set category
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        expense.setCategoryId(category);

        // ✅ get user from JWT (not from dto)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // because in CustomUserDetailsService you used email as username

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        expense.setUserid(user);

        // ✅ save expense
        Expenses saved = expenses.save(expense);

        // ✅ map to response DTO
        ExpenseResponseDto response = new ExpenseResponseDto();
        response.setId(saved.getExpenseId());
        response.setAmount(saved.getAmount());
        response.setExpenseDescription(saved.getExpenseDescription());
        response.setPaymentMethod(saved.getPaymentMethod());
        response.setCategoryId(saved.getCategoryId().getId());
        response.setUserId(saved.getUserid().getId());

        return response;
    }

    public Optional<ExpenseResponseDto> findById(int id){

        return expenses.findById(id).map(exp->model.map(exp,ExpenseResponseDto.class));
    }
    public List<ExpenseResponseDto> getAll(){
        return expenses.findAll().stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    @CacheEvict(value = {"userExpenses", "userExpensesByCategory"}, allEntries = true)
    public void delete(int id){
        expenses.deleteById(id);
    }
    @CacheEvict(value = {"userExpenses", "userExpensesByCategory"}, allEntries = true)
    public ExpenseResponseDto update(int id, ExpenseCreateDto data) {
        Expenses existing = expenses.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Map fields from DTO
        if (data.getAmount() != 0) existing.setAmount(data.getAmount());
        if (data.getExpenseDescription() != null && !data.getExpenseDescription().isEmpty())
            existing.setExpenseDescription(data.getExpenseDescription());
        if (data.getPaymentMethod() != null && !data.getPaymentMethod().isEmpty())
            existing.setPaymentMethod(data.getPaymentMethod());

        existing.setExpenseUpdate(LocalDateTime.now());

        Expenses saved = expenses.save(existing);
        return model.map(saved, ExpenseResponseDto.class);
    }@Cacheable(value = "userExpenses", key = "#id")
    public List<ExpenseResponseDto> getExpensesByuserId(int id) {
        return expenses.findExpenseById(id).stream()
                .map(exp -> model.map(exp, ExpenseResponseDto.class))
                .collect(Collectors.toList());

    }


    @Cacheable(value = "userExpensesByCategory", key = "#id1 + '-' + #id2")
    public List<ExpenseResponseDto>getExpensesByuserIdcategoryId(int id1,int id2){
        return expenses.getByUserid_IdAndCategoryId_Id(id1,id2).stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    public double  getMonthlyExpensesByuserId(int id,int month,int year){
        Double total= expenses.getMonthlyTotal(id,month,year);
        return total!=null?total:0.0;
    }
    public double getYearlyExpensesByuserId(int id,int year){
        Double total= expenses.getyearlyTotal(id,year);
        return total!=null?total:0.0;
    }
    public List<ExpenseResponseDto> getLastFiveExpensesByuserId(int id){
        return expenses.getlastFiveExpenses(id).stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    public List<ExpenseResponseDto>categorymonthlyExpenses(int id,int id1,int month,int year){
        return expenses.getcategoryMonthly(id,id1,month,year).stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    public List<ExpenseResponseDto> categoryYearlyExpenses(int id,int name,int year){
        return expenses.getcategoryYearly(id,name,year).stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    public double getsumDailyexpenses(int userid){
        Double total=expenses.getsumDailyExpenses(userid);
        return total!=null?total:0.0;
    }
    public List<ExpenseResponseDto> getDailyExpenses(int userid){
        return expenses.getDailyexpenses(userid).stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    public List<ExpenseResponseDto>getMonthlyExpensesBetweendates(int userid,LocalDateTime start,LocalDateTime end){
        return expenses.getExpensesBetweenDates(userid,start,end).stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    public double getsumMonthlyExpensesBetweendates(int userid,LocalDateTime start,LocalDateTime end){
        Double total=expenses.getSumExpensesBetweenDates(userid,start,end);
        return total!=null?total:0.0;
    }
    public List<Object[]>getTopCategoryByUser(int userid,int limit){
        return expenses.getTopCategoryByUser(userid,limit);
    }
    public double getMonthlyAverageExpenses(int userid){
        Double total=expenses.getMonthlyAverageExpenses(userid);
        return total!=null?total:0.0;
    }
    public double getAverageDailyExpenses(int userid){
        Double total=expenses.getAverageDailyExpenses(userid);
        return total!=null?total:0.0;
    }
    public List<ExpenseResponseDto>findByUserid_IdAndExpenseDescriptionContainingIgnoreCase(int userId, String keyword){
        return expenses.findByUserid_IdAndExpenseDescriptionContainingIgnoreCase(userId,keyword).stream().map(exp->model.map(exp,ExpenseResponseDto.class)).collect(Collectors.toList());
    }
    public Page<ExpenseResponseDto> findByUserid_Id(int userid, Pageable pageable){
        return expenses.findByUserid_Id(userid,pageable)
                .map(exp -> model.map(exp, ExpenseResponseDto.class));
    }
}
