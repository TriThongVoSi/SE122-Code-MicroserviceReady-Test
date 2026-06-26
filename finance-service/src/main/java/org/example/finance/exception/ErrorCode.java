package org.example.finance.exception;

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
    EXPENSE_NOT_FOUND("ERR_EXPENSE_NOT_FOUND", "Expense not found", HttpStatus.NOT_FOUND),
    EXPENSE_PERIOD_LOCKED("ERR_EXPENSE_PERIOD_LOCKED", "Expenses cannot be modified in a closed or locked season", HttpStatus.BAD_REQUEST),
    INVALID_SEASON_DATES("ERR_INVALID_SEASON_DATES", "Season start date must be before end date", HttpStatus.BAD_REQUEST),

    // BR codes
    MSG_1_MANDATORY_FIELD_EMPTY("MSG_1", "Please enter mandatory data.", HttpStatus.BAD_REQUEST),
    MSG_4_INVALID_FORMAT("MSG_4", "Invalid data format. Please enter again.", HttpStatus.BAD_REQUEST),
    MSG_7_SAVE_SUCCESS("MSG_7", "Save data successful.", HttpStatus.OK),
    MSG_9_CONSTRAINT_VIOLATION("MSG_9", "Your action is failed due to constraints in the system.", HttpStatus.BAD_REQUEST),
    MSG_10_EXPENSE_NOT_FOUND("MSG_10", "Expense not found.", HttpStatus.NOT_FOUND),
    MSG_10_SEASON_NOT_FOUND("MSG_10", "Season not found.", HttpStatus.NOT_FOUND),
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
