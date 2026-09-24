package com.orion.matching;

import org.springframework.stereotype.Service;

@Service
public class MatchingService {

    private final MatchRepository matchRepository;

    public MatchingService(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }
}