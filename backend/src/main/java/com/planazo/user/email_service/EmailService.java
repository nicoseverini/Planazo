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
        
        send(to, "Verify your Planazo account", html);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String url = webAuthUrl + "/reset-password?token=" + token;
        String html = loadHtmlTemplate("classpath:templates/mail/change_password.html");
        html = html.replace("${resetUrl}", url);
        
        send(to, "Reset your Planazo password", html);
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
    public void sendRemovedFromPlanEmail(String to, String planTitle) {
        String html = loadHtmlTemplate("classpath:templates/mail/removed_from_plan.html");
        html = html.replace("${planTitle}", planTitle);

        send(to, "You have been removed from a plan", html);
    }
    public void sendRequestToPlanCreator(String to, String requesterName, String planTitle) {
        String html = loadHtmlTemplate("classpath:templates/mail/request_to_plan_creator.html");
        html = html.replace("${requesterName}", requesterName);
        html = html.replace("${planTitle}", planTitle);

        send(to, "New request to join your plan: " + planTitle, html);
    }

    public void sendParticipantJoinedEmail(String to, String participantName, String planTitle) {
        String html = loadHtmlTemplate("classpath:templates/mail/participant_joined_plan.html");
        html = html.replace("${participantName}", participantName);
        html = html.replace("${planTitle}", planTitle);

        send(to, "New participant joined your plan: " + planTitle, html);
    }

    public void sendParticipantLeftEmail(String to, String participantName, String planTitle) {
        String html = loadHtmlTemplate("classpath:templates/mail/participant_left_plan.html");
        html = html.replace("${participantName}", participantName);
        html = html.replace("${planTitle}", planTitle);

        send(to, "A participant has left your plan: " + planTitle, html);
    }

    public void sendPlanDeletedEmail(String to, String planTitle, String reason) {
        String html = loadHtmlTemplate("classpath:templates/mail/plan_deleted.html");
        html = html.replace("${planTitle}", planTitle);
        html = html.replace("${reason}", reason != null && !reason.isEmpty() ? reason : "No reason provided");

        send(to, "Your plan has been deleted", html);
    }

    public void sendTouristPlaceDeletedEmail(String to, String placeName, String reason) {
        String html = loadHtmlTemplate("classpath:templates/mail/tourist_place_deleted.html");
        html = html.replace("${placeName}", placeName);
        html = html.replace("${reason}", reason != null && !reason.isEmpty() ? reason : "No reason provided");

        send(to, "Your tourist place has been deleted", html);
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
