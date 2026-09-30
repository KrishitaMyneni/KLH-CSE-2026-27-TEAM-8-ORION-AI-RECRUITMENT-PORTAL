package com.orion.screening;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/screenings")
public class ScreeningController {

    private final ScreeningRepository screeningRepository;
    private final ScreeningService screeningService;

    public ScreeningController(
            ScreeningRepository screeningRepository,
            ScreeningService screeningService) {

        this.screeningRepository = screeningRepository;
        this.screeningService = screeningService;
    }

    @GetMapping
    public List<Screening> getAllScreenings() {
        return screeningRepository.findAll();
    }

    @GetMapping("/{id}")
    public Screening getScreening(@PathVariable Long id) {
        return screeningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Screening not found"));
    }

    @PostMapping
    public Screening createScreening(@RequestBody Screening screening) {
        return screeningRepository.save(screening);
    }

    @PostMapping("/ai")
    public Map<String, Object> runAiScreening(
            @RequestParam Long jobId,
            @RequestParam String mode,
            @RequestParam int topN) {

        return screeningService.runAiScreening(
                jobId,
                mode,
                topN
        );
    }
}