package org.example.QuanLyMuaVu.module.admin.dto.request;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Filter object for Admin Reports queries.
 * Consolidates all filter parameters into a single object.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportFilter {

    /** Filter by year (converted to date range internally) */
    private Integer year;

    /** Alternative: explicit start date (takes precedence over year) */
    private LocalDate fromDate;

    /** Alternative: explicit end date (takes precedence over year) */
    private LocalDate toDate;

    /** Filter by crop ID */
    private Integer cropId;

    /** Filter by farm ID */
    private Integer farmId;

    /** Filter by plot ID */
    private Integer plotId;

    /** Filter by variety ID */
    private Integer varietyId;

    /**
     * Get effective start date for query.
     * Uses fromDate if set, otherwise computes from year.
     * Returns null if neither is set (no date filtering).
     */
    public LocalDate getEffectiveFromDate() {
        if (fromDate != null) {
            return fromDate;
        }
        if (year != null) {
            return LocalDate.of(year, 1, 1);
        }
        return null; // No date filtering when year is not specified
    }

    /**
     * Get effective end date for query (exclusive).
     * Uses toDate if set, otherwise computes from year.
     * Returns null if neither is set (no date filtering).
     */
    public LocalDate getEffectiveToDate() {
        if (toDate != null) {
            return toDate;
        }
        if (year != null) {
            return LocalDate.of(year + 1, 1, 1);
        }
        return null; // No date filtering when year is not specified
    }
}
