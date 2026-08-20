package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.admin.AdminActiveGameResponseDTO;
import com.batuhan.chess.api.dto.admin.AdminUserResponseDTO;
import com.batuhan.chess.application.service.admin.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Management", description = "Administrative operations for platform oversight and system maintenance.")
public class AdminController {

    private final AdminService adminService;

    @Operation(
        summary = "Get paginated registered users",
        description = "Retrieves a paginated list of all platform users for audit and management purposes."
    )
    @ApiResponse(responseCode = "200", description = "User list retrieved successfully")
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponseDTO>> getAllUsers(Pageable pageable) {
        log.info("ADMIN_ACTION: Request received to fetch paginated users - Page: {}, Size: {}",
            pageable.getPageNumber(), pageable.getPageSize());
        Page<AdminUserResponseDTO> users = adminService.getAllUsers(pageable);
        log.info("ADMIN_ACTION: Successfully retrieved {} users", users.getTotalElements());
        return ResponseEntity.ok(users);
    }

    @Operation(
        summary = "Deactivate user account",
        description = "Performs a soft-delete by deactivating a user account. Use with extreme caution."
    )
    @ApiResponse(responseCode = "204", description = "User account deactivated successfully")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.warn("ADMIN_ACTION: Administrative request to DEACTIVATE user account ID: {}", id);
        adminService.deleteUser(id);
        log.info("ADMIN_ACTION: User account ID: {} has been successfully deactivated", id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Get all active game sessions",
        description = "Retrieves all currently active game sessions held in memory for monitoring purposes."
    )
    @ApiResponse(responseCode = "200", description = "Active game list retrieved successfully")
    @GetMapping("/games/active")
    public ResponseEntity<List<AdminActiveGameResponseDTO>> getActiveGames() {
        log.info("ADMIN_ACTION: Fetching all active game sessions from memory");
        List<AdminActiveGameResponseDTO> activeGames = adminService.getActiveGames();
        log.info("ADMIN_ACTION: Retrieved {} active game sessions", activeGames.size());
        return ResponseEntity.ok(activeGames);
    }

    @Operation(
        summary = "Force finish an active game",
        description = "Emergency termination of a game session to handle ghost or stale connections."
    )
    @ApiResponse(responseCode = "204", description = "Game session terminated successfully")
    @PostMapping("/games/{gameId}/force-finish")
    public ResponseEntity<Void> forceFinishGame(@PathVariable String gameId) {
        log.warn("ADMIN_ACTION: EMERGENCY request to force-finish game session ID: {}", gameId);
        adminService.forceFinishGame(gameId);
        log.info("ADMIN_ACTION: Game session ID: {} has been terminated by administrator", gameId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Developer sandbox trigger",
        description = "Triggers a new game instance between two specified users for diagnostic or sandbox testing."
    )
    @ApiResponse(responseCode = "200", description = "Sandbox game instantiated successfully")
    @PostMapping("/sandbox/trigger-game")
    public ResponseEntity<Void> triggerSandboxGame(@RequestParam Long whiteId, @RequestParam Long blackId) {
        log.warn("ADMIN_ACTION: Sandbox trigger requested by admin for whiteId: {} and blackId: {}", whiteId, blackId);
        adminService.triggerSandboxGame(whiteId, blackId);
        log.info("ADMIN_ACTION: Sandbox game successfully created between {} and {}", whiteId, blackId);
        return ResponseEntity.ok().build();
    }
}
