/**
 * Universal date/time utilities for the backend
 * Handles parsing of ISO strings (UTC) from frontend and ensures proper storage
 */

/**
 * Parse a date/time string from the frontend
 * Frontend should send ISO strings (UTC), but we handle various formats for robustness
 * 
 * @param dateTimeStr - ISO string (preferred) or datetime string
 * @returns Date object (always in UTC internally)
 */
export function parseDateTime(dateTimeStr: string): Date {
  if (!dateTimeStr) {
    throw new Error("Date string is required");
  }

  // If it's already an ISO string (with Z or timezone), parse directly
  if (dateTimeStr.includes('T') && (dateTimeStr.includes('Z') || dateTimeStr.includes('+') || dateTimeStr.includes('-'))) {
    return new Date(dateTimeStr);
  }

  // Handle datetime-local format (YYYY-MM-DDTHH:mm) - should not happen if frontend converts properly
  // But we handle it as fallback
  const dtMatch = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/);
  if (dtMatch) {
    // Treat as local time and convert to UTC (server's local timezone)
    // This is a fallback - frontend should send ISO strings
    return new Date(dateTimeStr);
  }

  // Handle date-only format (YYYY-MM-DD)
  const dateMatch = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    // Create at midnight in server's local timezone, then it will be stored as UTC
    return new Date(dateTimeStr + 'T00:00:00');
  }

  // Fallback to standard Date parsing
  const parsed = new Date(dateTimeStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${dateTimeStr}`);
  }
  return parsed;
}

/**
 * Validate that a date is valid
 * 
 * @param date - Date object to validate
 * @returns true if date is valid, false otherwise
 */
export function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

