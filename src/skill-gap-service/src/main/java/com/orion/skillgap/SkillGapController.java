package com.orion.skillgap;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-gaps")
public class SkillGapController {

    private final SkillGapRepository skillGapRepository;

    public SkillGapController(SkillGapRepository skillGapRepository) {
        this.skillGapRepository = skillGapRepository;
    }

    @GetMapping
    public List<SkillGap> getAllSkillGaps() {
        return skillGapRepository.findAll();
    }

    @GetMapping("/{id}")
    public SkillGap getSkillGap(@PathVariable Long id) {
        return skillGapRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill gap not found"));
    }

    @PostMapping
    public SkillGap createSkillGap(@RequestBody SkillGap skillGap) {
        return skillGapRepository.save(skillGap);
    }
}