import Holidays from "date-holidays";

/**
 * Get holidays for a country for the current year
 * @param country - Country name (e.g., "United States", "United Kingdom")
 * @returns Array of holiday objects with date and name
 */
export function getHolidaysForCountry(country: string): Array<{ date: Date; name: string }> {
  try {
    // Map common country names to date-holidays country codes
    const countryCodeMap: Record<string, string> = {
      "United States": "US",
      "USA": "US",
      "United Kingdom": "GB",
      "UK": "GB",
      "Canada": "CA",
      "Australia": "AU",
      "Germany": "DE",
      "France": "FR",
      "Italy": "IT",
      "Spain": "ES",
      "India": "IN",
      "China": "CN",
      "Japan": "JP",
      "Brazil": "BR",
      "Mexico": "MX",
      "South Africa": "ZA",
      "New Zealand": "NZ",
      "Ireland": "IE",
      "Netherlands": "NL",
      "Belgium": "BE",
      "Switzerland": "CH",
      "Austria": "AT",
      "Sweden": "SE",
      "Norway": "NO",
      "Denmark": "DK",
      "Finland": "FI",
      "Poland": "PL",
      "Portugal": "PT",
      "Greece": "GR",
      "Turkey": "TR",
      "Russia": "RU",
      "South Korea": "KR",
      "Singapore": "SG",
      "Malaysia": "MY",
      "Thailand": "TH",
      "Indonesia": "ID",
      "Philippines": "PH",
      "Vietnam": "VN",
      "Argentina": "AR",
      "Chile": "CL",
      "Colombia": "CO",
      "Peru": "PE",
      "Venezuela": "VE",
      "Egypt": "EG",
      "Saudi Arabia": "SA",
      "United Arab Emirates": "AE",
      "UAE": "AE",
      "Israel": "IL",
      "Pakistan": "PK",
      "Bangladesh": "BD",
      "Sri Lanka": "LK",
      "Nepal": "NP",
      "Myanmar": "MM",
      "Cambodia": "KH",
      "Laos": "LA",
    };

    // Get country code from map, or try to use the country name directly
    const countryCode = countryCodeMap[country] || country;

    // Initialize holidays for the country
    const hd = new Holidays(countryCode);

    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Get holidays for current year and next year (to cover upcoming holidays)
    const holidays: Array<{ date: Date; name: string }> = [];
    
    // Helper function to parse holiday date as local date (date-only, no time component)
    // This prevents timezone conversion issues where holidays show one day before
    const parseHolidayDate = (dateInput: any): Date => {
      // If it's already a Date object, extract year, month, day and create local date
      if (dateInput instanceof Date) {
        const year = dateInput.getFullYear();
        const month = dateInput.getMonth();
        const day = dateInput.getDate();
        return new Date(year, month, day);
      }
      
      // If it's a string, try to parse it
      if (typeof dateInput === 'string') {
        // If it's in YYYY-MM-DD format, parse as local date
        const dateMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          const [, year, month, day] = dateMatch.map(Number);
          return new Date(year, month - 1, day);
        }
        // Otherwise, parse and extract components
        const parsed = new Date(dateInput);
        if (!isNaN(parsed.getTime())) {
          return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }
      }
      
      // Fallback: try to create a Date and extract components
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
      
      // Last resort: return current date
      return new Date();
    };

    // Get holidays for current year
    const currentYearHolidays = hd.getHolidays(currentYear);
    if (currentYearHolidays) {
      currentYearHolidays.forEach((holiday: any) => {
        holidays.push({
          date: parseHolidayDate(holiday.date),
          name: holiday.name
        });
      });
    }

    // Get holidays for next year (for upcoming holidays)
    const nextYearHolidays = hd.getHolidays(currentYear + 1);
    if (nextYearHolidays) {
      nextYearHolidays.forEach((holiday: any) => {
        holidays.push({
          date: parseHolidayDate(holiday.date),
          name: holiday.name
        });
      });
    }

    return holidays;
  } catch (error) {
    console.error(`Error fetching holidays for country ${country}:`, error);
    // Return empty array if there's an error
    return [];
  }
}

