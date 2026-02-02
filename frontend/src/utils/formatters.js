export function shortenCode(code, options = {}) {
  const { prefixMax = 6, head = 4, tail = 4 } = options;
  if (code === null || code === undefined) return '-';
  const s = String(code).trim();
  if (!s) return '-';

  // If there's a prefix like "TOOL-" or "JOB-", keep it.
  const dashIdx = s.indexOf('-');
  const hasPrefix = dashIdx > 0 && dashIdx <= prefixMax;

  if (hasPrefix) {
    const prefix = s.slice(0, dashIdx + 1); // include '-'
    const rest = s.slice(dashIdx + 1);
    if (rest.length <= head + tail + 1) return s;
    return `${prefix}${rest.slice(0, head)}…${rest.slice(-tail)}`;
  }

  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

/**
 * Generate short code from ID and date
 * Format: PREFIX + YYMMXXX (e.g., J2601001, T2601002)
 * PREFIX: J for Job, T for Tool
 * YYMM: Year-Month (26 for 2026, 01 for January)
 * XXX: Sequence number (001-999)
 */
export function generateShortCode(id, dateString, prefix = 'J') {
  if (!id) return '-';
  
  const date = new Date(dateString || new Date());
  const year = String(date.getFullYear()).slice(-2); // Last 2 digits
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Use ID's last 3 digits as sequence
  const idNum = String(id).slice(-3).padStart(3, '0');
  
  return `${prefix}${year}${month}${idNum}`;
}



