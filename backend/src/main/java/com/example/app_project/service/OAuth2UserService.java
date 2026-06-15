// 구글 로그인
package com.example.app_project.service;

import com.example.app_project.domain.Role;
import com.example.app_project.domain.User;
import com.example.app_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User oAuth2User = super.loadUser(request);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        // DB에 없으면 회원가입, 있으면 정보 업데이트
        User user = userRepository.findByEmail(email)
                .map(u -> u.update(name, picture))
                .orElse(User.builder()
                        .email(email)
                        .name(name)
                        .profileImage(picture)
                        .provider("google")
                        .role(Role.USER)
                        .build());

        userRepository.save(user);

        return oAuth2User;
    }
}