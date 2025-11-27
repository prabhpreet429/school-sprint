/**
 * Universal date/time utilities for the frontend
 * Handles conversion between local timezone and UTC for storage/retrieval
 */

/**
 * Convert datetime-local string (from HTML input) to UTC ISO string for backend storage
 * datetime-local inputs are in the user's local timezone but without timezone info
 * This converts from local timezone to UTC
 * 
 * @param dateTimeLocal - String in format YYYY-MM-DDTHH:mm (datetime-local format)
 * @returns ISO string in UTC (e.g., "2024-12-22T14:00:00.000Z")
 */
export function convertLocalToUTC(dateTimeLocal: string): string {
  if (!dateTimeLocal) return "";
  // When we create a Date from datetime-local string, JavaScript interprets it as LOCAL time
  // Then we convert it to UTC ISO string for storage
  const localDate = new Date(dateTimeLocal);
  return localDate.toISOString();
}

/**
 * Convert UTC ISO string (from backend) to datetime-local string for HTML input
 * This converts from UTC back to user's local timezone
 * 
 * @param dateUTC - ISO string in UTC or Date object
 * @returns String in format YYYY-MM-DDTHH:mm (datetime-local format)
 */
export function convertUTCToLocal(dateUTC: Date | string): string {
  if (!dateUTC) return "";
  const d = typeof dateUTC === 'string' ? new Date(dateUTC) : dateUTC;
  // Use local time methods to convert UTC back to user's local timezone
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert date-only string (YYYY-MM-DD) to UTC ISO string
 * Used for date inputs (not datetime)
 * 
 * @param dateLocal - String in format YYYY-MM-DD
 * @returns ISO string in UTC
 */
export function convertDateLocalToUTC(dateLocal: string): string {
  if (!dateLocal) return "";
  // Create date at midnight in local timezone, then convert to UTC
  const localDate = new Date(dateLocal + 'T00:00:00');
  return localDate.toISOString();
}

/**
 * Convert UTC ISO string to date-only string (YYYY-MM-DD)
 * Used for date inputs (not datetime)
 * 
 * @param dateUTC - ISO string in UTC or Date object
 * @returns String in format YYYY-MM-DD
 */
export function convertUTCToDateLocal(dateUTC: Date | string): string {
  if (!dateUTC) return "";
  const d = typeof dateUTC === 'string' ? new Date(dateUTC) : dateUTC;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Note: For date formatting, use date-fns format() directly:
 * import { format } from 'date-fns';
 * format(new Date(dateUTC), "MMM dd, yyyy HH:mm")
 * 
 * date-fns format() automatically converts UTC to local timezone
 */

