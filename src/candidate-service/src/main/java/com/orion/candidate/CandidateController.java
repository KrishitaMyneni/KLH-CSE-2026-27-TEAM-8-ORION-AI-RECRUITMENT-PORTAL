package com.orion.candidate;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateRepository candidateRepository;

    public CandidateController(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    @GetMapping("/{id}")
    public Candidate getCandidate(@PathVariable Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }

    @PostMapping
    public Candidate createCandidate(@RequestBody Candidate candidate) {
        return candidateRepository.save(candidate);
    }
    @PutMapping("/{id}")
public Candidate updateCandidate(
        @PathVariable Long id,
        @RequestBody Candidate candidate) {

    Candidate existing = candidateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));

    existing.setName(candidate.getName());
    existing.setEmail(candidate.getEmail());
    existing.setPhone(candidate.getPhone());
    existing.setSkills(candidate.getSkills());
    existing.setResumeUrl(candidate.getResumeUrl());

    return candidateRepository.save(existing);
}
    @DeleteMapping("/{id}")
    public String deleteCandidate(@PathVariable Long id) {
        candidateRepository.deleteById(id);
        return "Candidate deleted";
    }
}