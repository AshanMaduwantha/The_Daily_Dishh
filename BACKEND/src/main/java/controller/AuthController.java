package com.paf.socialmedia.controller;

import com.paf.socialmedia.document.User;
import com.paf.socialmedia.dto.LoginDTO;
import com.paf.socialmedia.dto.SignupDTO;
import com.paf.socialmedia.dto.TokenDTO;
import com.paf.socialmedia.repository.UserRepository;
import com.paf.socialmedia.security.TokenGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

// Resposible for user registration, login and token authentication
@CrossOrigin("*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    UserDetailsManager userDetailsManager;

    @Autowired
    TokenGenerator tokenGenerator;

    @Autowired
    DaoAuthenticationProvider daoAuthenticationProvider;

    @Autowired
    @Qualifier("jwtRefreshTokenAuthProvider")
    JwtAuthenticationProvider refreshTokenAuthProvider;

    @Autowired
    UserRepository userRepository;

    // Register a new user and accepts 'SignupDTO' object
    // Creates a new user in the database based on username and password
    @PostMapping("/register")
    public ResponseEntity register(@RequestBody SignupDTO signupDTO) {
        User user = new User(signupDTO.getUsername(), signupDTO.getPassword());
        userDetailsManager.createUser(user);

        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(user, signupDTO.getPassword(), Collections.EMPTY_LIST);

        return ResponseEntity.ok(tokenGenerator.createToken(authentication));
    }
}