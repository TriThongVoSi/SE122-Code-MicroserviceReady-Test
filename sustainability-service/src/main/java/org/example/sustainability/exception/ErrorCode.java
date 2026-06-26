package org.example.sustainability.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION("ERR_UNCATEGORIZED_EXCEPTION", "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("ERR_BAD_REQUEST", "Bad request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("ERR_UNAUTHORIZED", "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("ERR_FORBIDDEN", "Forbidden", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND("ERR_RESOURCE_NOT_FOUND", "Resource not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("ERR_USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
    SEASON_NOT_FOUND("ERR_SEASON_NOT_FOUND", "Season not found", HttpStatus.NOT_FOUND),
    PLOT_NOT_FOUND("ERR_PLOT_NOT_FOUND", "Plot not found", HttpStatus.NOT_FOUND),
    FARM_NOT_FOUND("ERR_FARM_NOT_FOUND", "Farm not found", HttpStatus.NOT_FOUND),
    LEGACY_NUTRIENT_INPUT_DEPRECATED("ERR_LEGACY_NUTRIENT_INPUT_DEPRECATED", "Legacy nutrient input source is deprecated", HttpStatus.BAD_REQUEST);

    ErrorCode(String code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final String code;
    private final String message;
    private final HttpStatus statusCode;
}
