// 구글 로그인
package com.example.app_project.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserRequestDto {

    private String email;
    private String name;
    private String nickname;
    private String password;
}