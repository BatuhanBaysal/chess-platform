package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.admin.AdminActiveGameResponseDTO;
import com.batuhan.chess.api.dto.admin.AdminUserResponseDTO;
import com.batuhan.chess.application.service.admin.AdminService;
import com.batuhan.chess.application.service.game.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Admin Management", description = "Centralized administrative and operational oversight operations")
public class AdminController {

    private final AdminService adminService;
    private final GameService gameService;

    @Operation(summary = "Get paginated registered users", description = "Retrieves a paginated list of platform users with administrative metrics.")
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdminUserResponseDTO>> getAllUsers(Pageable pageable) {
        log.info("Admin action: Fetching paginated users");
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @Operation(summary = "Delete user account", description = "Performs an administrative override to permanently remove a user account by ID.")
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.warn("Admin action: Deleting user account with id: {}", id);
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all active game sessions", description = "Monitors real-time active games from memory to detect and troubleshoot ghost sessions.")
    @GetMapping("/games/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminActiveGameResponseDTO>> getActiveGames() {
        log.info("Admin action: Fetching all active game sessions");
        return ResponseEntity.ok(adminService.getActiveGames());
    }

    @Operation(summary = "Force finish an active game", description = "Triggers an emergency termination and abandonment routine for stale or ghost game sessions.")
    @PostMapping("/games/{gameId}/force-finish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> forceFinishGame(@PathVariable String gameId) {
        log.warn("Admin action: Forcing finish/abandonment for game session: {}", gameId);
        adminService.forceFinishGame(gameId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Developer sandbox trigger", description = "Triggers custom test scenarios for development purposes by instantiating a new active game.")
    @PostMapping("/sandbox/trigger-game")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> triggerSandboxGame(@RequestParam Long whiteId, @RequestParam Long blackId) {
        log.warn("Admin action: Developer sandbox triggered. Creating test game between white ID: {} and black ID: {}", whiteId, blackId);
        gameService.createGame(whiteId, blackId);
        return ResponseEntity.ok().build();
    }
}
