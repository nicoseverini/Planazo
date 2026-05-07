package com.planazo.user.email_service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final ResourceLoader resourceLoader;

    public EmailService(JavaMailSender mailSender, ResourceLoader resourceLoader) {
        this.mailSender = mailSender;
        this.resourceLoader = resourceLoader;
    }

    public void sendVerificationEmail(String to, String token) {
        String url = "http://localhost:3000/verify_user?token=" + token; // frontend URL
        String html = loadHtmlTemplate("classpath:templates/mail/verification.html");
        html = html.replace("${verificationUrl}", url);
        
        send(to, "Verificá tu cuenta de Planazo", html);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String url = "http://localhost:3000/reset-password?token=" + token; // frontend URL
        String html = loadHtmlTemplate("classpath:templates/mail/change_password.html");
        html = html.replace("${resetUrl}", url);
        
        send(to, "Recuperar contraseña - Planazo", html);
    }

    private void send(String to, String subject, String content) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setText(content, true); 
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("onboarding@resend.dev");
            
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new IllegalStateException("Error al enviar el email a " + to, e);
        }
    }
    private String loadHtmlTemplate(String path) {
        try {
            Resource resource = resourceLoader.getResource(path);
            try (Scanner scanner = new Scanner(resource.getInputStream(), StandardCharsets.UTF_8)) {
                return scanner.useDelimiter("\\A").next();
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo cargar la plantilla de mail: " + path, e);
        }
    }
}
