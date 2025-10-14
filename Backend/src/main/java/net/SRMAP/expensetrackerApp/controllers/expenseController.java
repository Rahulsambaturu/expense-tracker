package net.SRMAP.expensetrackerApp.controllers;
import net.SRMAP.expensetrackerApp.AuthUtil.AuthUtil;
import net.SRMAP.expensetrackerApp.dto.Expenses.ExpenseCreateDto;
import net.SRMAP.expensetrackerApp.dto.Expenses.ExpenseResponseDto;
import net.SRMAP.expensetrackerApp.entity.Expenses;
import net.SRMAP.expensetrackerApp.entity.User;
import net.SRMAP.expensetrackerApp.respositry.ExpenseRepository;
import net.SRMAP.expensetrackerApp.respositry.UserRepository;
import net.SRMAP.expensetrackerApp.securityConfig.CustomUserDetails;
import net.SRMAP.expensetrackerApp.securityConfig.CustomUserDetailsService;
import org.hibernate.jdbc.Expectation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import net.SRMAP.expensetrackerApp.service.ExpenseService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/expenses")
public class expenseController {
    @Autowired
    private AuthUtil authUtil;
    @Autowired
    private ExpenseService expense;
    @Autowired
    private CustomUserDetailsService user;
    @Autowired
    private UserRepository userRepository;
    @GetMapping("/admin")
    public ResponseEntity<List<ExpenseResponseDto>> getall(){
        return new ResponseEntity<>(expense.getAll(), HttpStatus.OK);
    }
    @GetMapping("/admin/{Id}")
    public ResponseEntity<?> GetOne(@PathVariable int Id){
        Optional<ExpenseResponseDto> get=expense.findById(Id);
        if(get.isPresent()){
            return new ResponseEntity<>(get.get(),HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    @PostMapping
    public ResponseEntity<?> save(@RequestBody ExpenseCreateDto data) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName(); // email from JWT

            // find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // inject userId into DTO
            data.setUserId(user.getId());

            ExpenseResponseDto savedExpense = expense.Save(data);
            return new ResponseEntity<>(savedExpense, HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?>Update(@PathVariable int id,@RequestBody ExpenseCreateDto data){
        try{
            return new ResponseEntity<>(expense.update(id,data),HttpStatus.OK);
        }
        catch(Exception c){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @DeleteMapping("/{Id}")
    public ResponseEntity<?>delete(@PathVariable int Id){

        ExpenseResponseDto get=expense.findById(Id).orElse(null);
         if(get!=null){
             expense.delete(Id);
             return new ResponseEntity<>(HttpStatus.NO_CONTENT);
         }
         return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserExpenses() {
        int id=authUtil.getUserId();
        List<ExpenseResponseDto> expenses = expense.getExpensesByuserId(id);
        if (expenses.isEmpty()) return new ResponseEntity<>(HttpStatus.NO_CONTENT);

        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }


    @GetMapping("/user/category/{id1}")
    public ResponseEntity<List<ExpenseResponseDto>>getuserExpensesBycategory(@PathVariable int id1){
        int id=authUtil.getUserId();
        List<ExpenseResponseDto>get=expense.getExpensesByuserIdcategoryId(id,id1);
        if(get.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);

        }
        return new ResponseEntity<>(get,HttpStatus.OK);
    }
    @GetMapping("/user/month/{month}/year/{year}")
    public ResponseEntity<?> getmonthlyexpenses(@PathVariable int month,@PathVariable int year){
        int id=authUtil.getUserId();
        try{
            double total=expense.getMonthlyExpensesByuserId(id,month,year);
            return new ResponseEntity<>(total,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping("/user/year/{year}")
    public ResponseEntity<Double> getYearlyExpenses(@PathVariable int year){
        int id=authUtil.getUserId();
        try{
            double total=expense.getYearlyExpensesByuserId(id,year);
            return new ResponseEntity<>(total,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping("/user/lastFiveExpenses")
    public ResponseEntity<?>getLastFiveExpenses(){
        int id=authUtil.getUserId();
        try{
            List<ExpenseResponseDto> total=expense.getLastFiveExpensesByuserId(id);
            return new ResponseEntity<>(total,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping("/user/category/{id1}/month/{month}/year/{year}")
    public ResponseEntity<List<ExpenseResponseDto>>categorymonthlyExpenses(@PathVariable int id1,@PathVariable int month,@PathVariable int year){
            int id=authUtil.getUserId();
            List<ExpenseResponseDto> total=expense.categorymonthlyExpenses(id,id1,month, year);
            return ResponseEntity.ok(total);

    }
    @GetMapping("/user/category/{id1}/year/{year}")
    public ResponseEntity<List<ExpenseResponseDto>>categoryYearlyExpenses(@PathVariable int id1,@PathVariable int year){
        int id=authUtil.getUserId();
        List<ExpenseResponseDto>total=expense.categoryYearlyExpenses(id,id1, year);
            return  ResponseEntity.ok(total);

    }
    @GetMapping("/user/DailyexpensesSum")
    public ResponseEntity<Double> getsumDailyexpenses(){
         int id=authUtil.getUserId();

            double total=expense.getsumDailyexpenses(id);
            return ResponseEntity.ok(total);
    }
    @GetMapping("/user/DailyexpensesList")
    public ResponseEntity<List<ExpenseResponseDto>> getDailyExpenses(){
          int id=authUtil.getUserId();
            List<ExpenseResponseDto> total=expense.getDailyExpenses(id);
            return  ResponseEntity.ok(total);
    }
    @GetMapping("/user/Monthly/{start}/{end}")
    public ResponseEntity<List<ExpenseResponseDto>>getMonthlyExpensesBetweendates( @PathVariable String start,@PathVariable String end){
        LocalDateTime startDate = LocalDateTime.parse(start);
        LocalDateTime endDate = LocalDateTime.parse(end);
        int id=authUtil.getUserId();
            List<ExpenseResponseDto> total=expense.getMonthlyExpensesBetweendates(id,startDate,endDate);
            return ResponseEntity.ok(total);

    }
    @GetMapping("/user/MonthlySum/{start}/{end}")
    public ResponseEntity<Double>getsumMonthlyExpensesBetweendates(@PathVariable String start,@PathVariable String end){
         LocalDateTime startDate = LocalDateTime.parse(start);
         LocalDateTime endDate = LocalDateTime.parse(end);
        int id=authUtil.getUserId();
            double total=expense.getsumMonthlyExpensesBetweendates(id,startDate,endDate);
            return  ResponseEntity.ok(total);
    }
    @GetMapping("/user/limit/{limit}")
    public ResponseEntity<?>getTopCategoryByUser(@PathVariable int limit){
            int id=authUtil.getUserId();
            List<Object[]> total=expense.getTopCategoryByUser(id,limit);
            return  ResponseEntity.ok(total);
    }
    @GetMapping("/user/monthlyAvg")
    public ResponseEntity<Double>getMonthlyAverageExpenses(){
        int id=authUtil.getUserId();
            double total=expense.getMonthlyAverageExpenses(id);
            return ResponseEntity.ok(total);
    }
    @GetMapping("/user/dailyAvg")
    public ResponseEntity<Double>getAverageDailyExpenses(){
            int id=authUtil.getUserId();
            double total=expense.getAverageDailyExpenses(id);
            return ResponseEntity.ok(total);
    }
    @GetMapping("/user/description/{keyword}")
    public ResponseEntity<List<ExpenseResponseDto>>findByUserid_IdAndExpenseDescriptionContainingIgnoreCase( @PathVariable String keyword){
            int id=authUtil.getUserId();
            List<ExpenseResponseDto> total=expense.findByUserid_IdAndExpenseDescriptionContainingIgnoreCase(id,keyword);
            if(total.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(total,HttpStatus.OK);

    }
    @GetMapping("/user/print")
    public ResponseEntity<Page<ExpenseResponseDto>> findByUserid_Id(Pageable pageable){
        int id=authUtil.getUserId();
        return new ResponseEntity<>(expense.findByUserid_Id(id,pageable),HttpStatus.OK);
    }

}
