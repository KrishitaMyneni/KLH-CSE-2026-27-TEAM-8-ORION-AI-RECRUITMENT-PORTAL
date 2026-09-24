package com.orion.skillgap;

import org.springframework.stereotype.Service;

@Service
public class SkillGapService {

    private final SkillGapRepository skillGapRepository;

    public SkillGapService(SkillGapRepository skillGapRepository) {
        this.skillGapRepository = skillGapRepository;
    }
}