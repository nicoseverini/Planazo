package com.planazo.user.email_service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final ResourceLoader resourceLoader;
    private final String webAuthUrl;
    private final String mailFrom;

    public EmailService(
            JavaMailSender mailSender, 
            ResourceLoader resourceLoader,
            @Value("${app.web-auth-url}") String webAuthUrl,
            @Value("${app.mail.from}") String mailFrom) {
        this.mailSender = mailSender;
        this.resourceLoader = resourceLoader;
        this.webAuthUrl = webAuthUrl;
        this.mailFrom = mailFrom;
    }

    public void sendVerificationEmail(String to, String token) {
        String url = webAuthUrl + "/verify-email?token=" + token;
        String html = loadHtmlTemplate("classpath:templates/mail/verification.html");
        html = html.replace("${verificationUrl}", url);
        
        send(to, "Verificá tu cuenta de Planazo", html);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String url = webAuthUrl + "/reset-password?token=" + token;
        String html = loadHtmlTemplate("classpath:templates/mail/change_password.html");
        html = html.replace("${resetUrl}", url);
        
        send(to, "Recuperar contraseña de Planazo", html);
    }

    private void send(String to, String subject, String content) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setText(content, true); 
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom(mailFrom);
            
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new IllegalStateException("Error sending email to: " + to, e);
        }
    }
    public void sendAcceptedToPlanEmail(String to, String planTitle) {
        String html = loadHtmlTemplate("classpath:templates/mail/accepted_to_plan.html");
        html = html.replace("${planTitle}", planTitle);
        
        send(to, "You have been accepted to a plan!", html);
    }
    public void sendRejectedFromPlanEmail(String to, String planTitle) {
        String html = loadHtmlTemplate("classpath:templates/mail/rejected_from_plan.html");
        html = html.replace("${planTitle}", planTitle);
        
        send(to, "Your request to join the plan has been rejected.", html);
    }
    private String loadHtmlTemplate(String path) {
        try {
            Resource resource = resourceLoader.getResource(path);
            try (Scanner scanner = new Scanner(resource.getInputStream(), StandardCharsets.UTF_8)) {
                return scanner.useDelimiter("\\A").next();
            }
        } catch (IOException e) {
            throw new RuntimeException("Err with reading template: " + path, e);
        }
    }
}
