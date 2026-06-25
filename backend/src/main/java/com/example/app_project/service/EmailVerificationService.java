package com.example.app_project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JavaMailSender mailSender;

    private static final int CODE_LENGTH = 6;
    private static final int EXPIRY_MINUTES = 5;

    private record VerificationEntry(String code, LocalDateTime expiry) {}

    private final Map<String, VerificationEntry> store = new ConcurrentHashMap<>();

    public void sendCode(String email) {
        String code = generateCode();
        store.put(email, new VerificationEntry(code, LocalDateTime.now().plusMinutes(EXPIRY_MINUTES)));
        sendEmail(email, code);
    }

    public boolean verifyCode(String email, String code) {
        VerificationEntry entry = store.get(email);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            store.remove(email);
            return false;
        }
        if (!entry.code().equals(code)) return false;
        store.remove(email);
        return true;
    }

    private String generateCode() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }

    private void sendEmail(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(to);
            helper.setSubject("[Limitless] 이메일 인증번호");
            helper.setText(buildHtml(code), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송에 실패했습니다.");
        }
    }

    private String buildHtml(String code) {
        return """
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
                  <h2 style="color:#00C896;margin-bottom:8px;">Limitless 이메일 인증</h2>
                  <p style="color:#333;margin-bottom:24px;">아래 인증번호를 입력해 주세요. 인증번호는 5분간 유효합니다.</p>
                  <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;">
                    %s
                  </div>
                </div>
                """.formatted(code);
    }
}
