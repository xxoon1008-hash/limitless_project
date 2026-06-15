// 구글 로그인
package com.example.app_project.dto;

import com.example.app_project.domain.User;
import lombok.Getter;

@Getter
public class UserResponseDto {

    private Long id;
    private String email;
    private String name;
    private String nickname;
    private String profileImage;
    private String provider;

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
        this.provider = user.getProvider();
    }
}