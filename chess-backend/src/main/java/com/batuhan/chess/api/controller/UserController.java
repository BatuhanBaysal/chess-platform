package com.batuhan.chess.api.controller;

import com.batuhan.chess.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                Map<String, Object> stats = new HashMap<>();
                stats.put("username", user.getUsername());
                stats.put("elo", user.getEloRating() != null ? user.getEloRating() : 400);
                stats.put("wins", user.getTotalWins());
                stats.put("losses", user.getTotalLosses());
                stats.put("draws", user.getTotalDraws());
                return ResponseEntity.ok(stats);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
