package com.example.app_project.config;

import com.example.app_project.jwt.JwtTokenProvider;
import com.example.app_project.service.OAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2UserService oAuth2UserService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/users/signup").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestResolver(
                                        new CustomAuthorizationRequestResolver(
                                                clientRegistrationRepository,
                                                "/oauth2/authorization"
                                        )
                                )
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserService))
                        .successHandler((request, response, authentication) -> {
                            String token = jwtTokenProvider.generateToken(authentication);
                            String webRedirect = (String) request.getSession().getAttribute("web_redirect");
                            if (webRedirect != null && !webRedirect.isBlank()) {
                                request.getSession().removeAttribute("web_redirect");
                                response.sendRedirect(webRedirect + "?token=" + token);
                            } else {
                                response.sendRedirect("myapp://redirect?token=" + token);
                            }
                        }));

        return http.build();
    }
}