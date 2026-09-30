package com.orion.application;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NotificationClient {

    private final RestClient notificationClient;
    private final RestClient jobClient;
    private final RestClient candidateClient;

    public NotificationClient() {
        this.notificationClient = RestClient.builder()
                .baseUrl("http://localhost:8088")
                .build();

        this.jobClient = RestClient.builder()
                .baseUrl("http://localhost:8083")
                .build();

        this.candidateClient = RestClient.builder()
                .baseUrl("http://localhost:8082")
                .build();
    }

    public void createNotification(Long userId, String message) {
        notificationClient.post()
                .uri("/api/notifications")
                .body(new NotificationRequest(userId, message, false))
                .retrieve()
                .toBodilessEntity();
    }

    public Long getRecruiterId(Long jobId) {
        JobResponse job = jobClient.get()
                .uri("/api/jobs/{id}", jobId)
                .retrieve()
                .body(JobResponse.class);

        return job.recruiterId();
    }

    public Long getCandidateUserId(Long candidateId) {
        CandidateResponse candidate = candidateClient.get()
                .uri("/api/candidates/{id}", candidateId)
                .retrieve()
                .body(CandidateResponse.class);

        return candidate.userId();
    }

    private record NotificationRequest(
            Long userId,
            String message,
            boolean readStatus
    ) {
    }

    private record JobResponse(
            Long id,
            Long recruiterId,
            String title,
            String company,
            String location,
            String description,
            String requiredSkills
    ) {
    }

    private record CandidateResponse(
            Long id,
            Long userId,
            String name,
            String email,
            String phone,
            String skills,
            String resumeUrl,
            String resumeText
    ) {
    }
    public String getJobTitle(Long jobId) {
    JobResponse job = jobClient.get()
            .uri("/api/jobs/{id}", jobId)
            .retrieve()
            .body(JobResponse.class);

    return job.title();
}
}