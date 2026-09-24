package com.orion.skillgap;

import jakarta.persistence.*;

@Entity
@Table(name = "skill_gaps")
public class SkillGap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateId;
    private Long jobId;
    private String strongMatches;
    private String partialMatches;
    private String missingSkills;
    private Double skillCoverage;

    public SkillGap() {
    }

    public Long getId() {
        return id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getStrongMatches() {
        return strongMatches;
    }

    public void setStrongMatches(String strongMatches) {
        this.strongMatches = strongMatches;
    }

    public String getPartialMatches() {
        return partialMatches;
    }

    public void setPartialMatches(String partialMatches) {
        this.partialMatches = partialMatches;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public Double getSkillCoverage() {
        return skillCoverage;
    }

    public void setSkillCoverage(Double skillCoverage) {
        this.skillCoverage = skillCoverage;
    }
}