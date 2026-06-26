package org.example.incident.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION("ERR_UNCATEGORIZED_EXCEPTION", "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    KEY_INVALID("ERR_KEY_INVALID", "Invalid key", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR("ERR_INTERNAL_SERVER_ERROR", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("ERR_BAD_REQUEST", "Bad request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("ERR_UNAUTHORIZED", "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("ERR_FORBIDDEN", "Forbidden", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND("ERR_RESOURCE_NOT_FOUND", "Resource not found", HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE("ERR_DUPLICATE_RESOURCE", "Resource already exists", HttpStatus.CONFLICT),
    UNAUTHENTICATED("ERR_UNAUTHENTICATED", "Unauthenticated", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND("ERR_USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
    SEASON_NOT_FOUND("ERR_SEASON_NOT_FOUND", "Season not found", HttpStatus.NOT_FOUND),
    
    INCIDENT_NOT_FOUND("ERR_INCIDENT_NOT_FOUND", "Incident not found", HttpStatus.NOT_FOUND),
    INVALID_INCIDENT_STATUS_TRANSITION("ERR_INVALID_INCIDENT_STATUS_TRANSITION", "Invalid incident status transition", HttpStatus.BAD_REQUEST),
    RESOLUTION_NOTE_REQUIRED("ERR_RESOLUTION_NOTE_REQUIRED", "Resolution note is required when resolving an incident", HttpStatus.BAD_REQUEST),
    CANNOT_DELETE_RESOLVED_INCIDENT("ERR_CANNOT_DELETE_RESOLVED_INCIDENT", "Cannot delete a resolved incident", HttpStatus.BAD_REQUEST),
    INVALID_DEADLINE("ERR_INVALID_DEADLINE", "Deadline must be today or in the future", HttpStatus.BAD_REQUEST),
    INVALID_SEASON_STATUS_TRANSITION("ERR_INVALID_SEASON_STATUS_TRANSITION", "Invalid season status transition", HttpStatus.BAD_REQUEST),

    // BR codes
    MSG_1_MANDATORY_FIELD_EMPTY("MSG_1", "Please enter mandatory data.", HttpStatus.BAD_REQUEST),
    MSG_4_INVALID_FORMAT("MSG_4", "Invalid data format. Please enter again.", HttpStatus.BAD_REQUEST),
    MSG_7_SAVE_SUCCESS("MSG_7", "Save data successful.", HttpStatus.OK),
    MSG_9_CONSTRAINT_VIOLATION("MSG_9", "Your action is failed due to constraints in the system.", HttpStatus.BAD_REQUEST),
    MSG_11_CONFIRMATION("MSG_11", "Are you sure you want to proceed with this action?", HttpStatus.OK);

    ErrorCode(String code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final String code;
    private final String message;
    private final HttpStatus statusCode;
}
