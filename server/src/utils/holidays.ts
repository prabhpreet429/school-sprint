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
    
    // Get holidays for current year
    const currentYearHolidays = hd.getHolidays(currentYear);
    if (currentYearHolidays) {
      currentYearHolidays.forEach((holiday: any) => {
        holidays.push({
          date: new Date(holiday.date),
          name: holiday.name
        });
      });
    }

    // Get holidays for next year (for upcoming holidays)
    const nextYearHolidays = hd.getHolidays(currentYear + 1);
    if (nextYearHolidays) {
      nextYearHolidays.forEach((holiday: any) => {
        holidays.push({
          date: new Date(holiday.date),
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

