package com.orion.screening;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screenings")
public class ScreeningController {

    private final ScreeningRepository screeningRepository;

    public ScreeningController(ScreeningRepository screeningRepository) {
        this.screeningRepository = screeningRepository;
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
}