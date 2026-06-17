//개짬뽕
package com.example.app_project.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String nickname;

    @Column
    private String password;

    @Column(name = "profile_image")
    private String profileImage;

    @Column
    private String provider;

    @Column
    private LocalDate birthDate;    // ← 여기 안에!

    @Column
    private Double weight;          // ← 여기 안에!

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder
    public User(String email, String name, String nickname,
                String password, String profileImage,
                String provider, Role role) {
        this.email = email;
        this.name = name;
        this.nickname = nickname;
        this.password = password;
        this.profileImage = profileImage;
        this.provider = provider;
        this.role = role;
    }

    public User update(String name, String profileImage) {
        this.name = name;
        this.profileImage = profileImage;
        return this;
    }

    public void updateWeight(Double weight) {
        this.weight = weight;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}