package com.orion.application;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final NotificationClient notificationClient;

    public ApplicationController(
            ApplicationRepository applicationRepository,
            NotificationClient notificationClient) {
        this.applicationRepository = applicationRepository;
        this.notificationClient = notificationClient;
    }

    @GetMapping
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @GetMapping("/{id}")
    public Application getApplication(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    @PostMapping
    public Application createApplication(@RequestBody Application application) {
        Application savedApplication = applicationRepository.save(application);

        String jobTitle =
                notificationClient.getJobTitle(application.getJobId());

        notificationClient.createNotification(
                getRecruiterId(application.getJobId()),
                "A new candidate has applied for " + jobTitle + "."
        );

        return savedApplication;
    }

    @PutMapping("/{id}/status")
    public Application updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);

        Application savedApplication =
                applicationRepository.save(application);

        Long candidateUserId =
                notificationClient.getCandidateUserId(
                        application.getCandidateId()
                );

        String jobTitle =
                notificationClient.getJobTitle(
                        application.getJobId()
                );

        notificationClient.createNotification(
                candidateUserId,
                "Your application for " + jobTitle +
                        " has been updated to " + status + "."
        );

        return savedApplication;
    }

    @DeleteMapping("/{id}")
    public String deleteApplication(@PathVariable Long id) {
        applicationRepository.deleteById(id);
        return "Application deleted";
    }

    private Long getRecruiterId(Long jobId) {
        return notificationClient.getRecruiterId(jobId);
    }
}