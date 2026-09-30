package com.orion.screening;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
public class ScreeningService {

        private final ScreeningRepository screeningRepository;
        private final RestClient restClient;
        private final ObjectMapper objectMapper;

        public ScreeningService(
                        ScreeningRepository screeningRepository,
                        RestClient.Builder restClientBuilder,
                        ObjectMapper objectMapper) {

                this.screeningRepository = screeningRepository;
                this.restClient = restClientBuilder.build();
                this.objectMapper = objectMapper;
        }

        public Map<String, Object> runAiScreening(
                        Long jobId,
                        String mode,
                        int topN) {

                Map<String, Object> rawJob = restClient.get()
                                .uri("http://localhost:8083/api/jobs/" + jobId)
                                .retrieve()
                                .body(Map.class);

                Map<String, Object> job = new HashMap<>();

                job.put("job_id", rawJob.get("id"));
                job.put("title", rawJob.get("title"));
                job.put("company", rawJob.get("company"));
                job.put("location", rawJob.get("location"));
                job.put("description", rawJob.get("description"));
                job.put("required_skills", rawJob.get("requiredSkills"));

                List<Map<String, Object>> applications = restClient.get()
                                .uri("http://localhost:8084/api/applications")
                                .retrieve()
                                .body(List.class);

                List<Map<String, Object>> candidates = new ArrayList<>();

                for (Map<String, Object> application : applications) {

                        Number applicationJobId = (Number) application.get("jobId");

                        if (applicationJobId == null ||
                                        applicationJobId.longValue() != jobId) {
                                continue;
                        }

                        Number candidateId = (Number) application.get("candidateId");

                        if (candidateId == null) {
                                continue;
                        }

                        Map<String, Object> rawCandidate = restClient.get()
                                        .uri("http://localhost:8082/api/candidates/"
                                                        + candidateId.longValue())
                                        .retrieve()
                                        .body(Map.class);

                        Map<String, Object> candidate = new HashMap<>();

                        candidate.put("candidate_id", rawCandidate.get("id"));
                        candidate.put("name", rawCandidate.get("name"));
                        candidate.put("email", rawCandidate.get("email"));
                        candidate.put("phone", rawCandidate.get("phone"));
                        candidate.put("skills", rawCandidate.get("skills"));
                        candidate.put("resume_url", rawCandidate.get("resumeUrl"));
                        candidate.put("resume_text", rawCandidate.get("resumeText"));

                        candidates.add(candidate);
                }

                Map<String, Object> request = new HashMap<>();

                request.put("mode", mode);
                request.put("job", job);
                request.put("candidates", candidates);
                request.put("top_n", topN);

                try {

                        String jsonBody = objectMapper.writeValueAsString(request);

                        System.out.println("AI REQUEST BODY:");
                        System.out.println(jsonBody);

                        java.net.URL url = new java.net.URL(
                                        "http://localhost:8000/api/ai/screen");

                        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();

                        connection.setRequestMethod("POST");
                        connection.setRequestProperty(
                                        "Content-Type",
                                        "application/json");
                        connection.setDoOutput(true);

                        byte[] jsonBytes = jsonBody.getBytes(
                                        java.nio.charset.StandardCharsets.UTF_8);

                        connection.setFixedLengthStreamingMode(
                                        jsonBytes.length);

                        try (java.io.OutputStream outputStream = connection.getOutputStream()) {

                                outputStream.write(jsonBytes);
                                outputStream.flush();
                        }

                        int statusCode = connection.getResponseCode();

                        java.io.InputStream inputStream;

                        if (statusCode >= 200 && statusCode < 300) {
                                inputStream = connection.getInputStream();
                        } else {
                                inputStream = connection.getErrorStream();
                        }

                        String responseBody = new String(
                                        inputStream.readAllBytes(),
                                        java.nio.charset.StandardCharsets.UTF_8);

                        if (statusCode < 200 || statusCode >= 300) {
                                throw new RuntimeException(
                                                "AI service returned " +
                                                                statusCode +
                                                                ": " +
                                                                responseBody);
                        }

                        return objectMapper.readValue(
                                        responseBody,
                                        Map.class);

                } catch (Exception e) {

                        throw new RuntimeException(
                                        "Failed to send screening request to AI service: "
                                                        + e.getMessage(),
                                        e);
                }
        }
}