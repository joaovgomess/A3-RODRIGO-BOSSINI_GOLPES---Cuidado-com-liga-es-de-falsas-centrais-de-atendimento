package com.felipe.backend.controller;

import com.felipe.backend.entity.UserEntity;
import com.felipe.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository repository;

    public UserController(UserRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<UserEntity> listar() {
        return repository.findAll();
    }

    @PostMapping
    public UserEntity salvar(@RequestBody UserEntity user) {
        return repository.save(user);
    }
}
