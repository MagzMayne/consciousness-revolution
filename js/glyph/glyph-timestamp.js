// RootIB: RB-20260319142113-F9DFB84D
/**
 * GLYPH TIMESTAMP MODULE
 * Version: 1.0.0
 *
 * Base-60 time encoding for all system events.
 * Universal timestamps that align with GLYPH notation.
 */

const GlyphTimestamp = (function() {
  'use strict';

  // Get Base60 module if available
  const Base60 = typeof GlyphBase60 !== 'undefined' ? GlyphBase60 : null;

  // Epoch: January 1, 2025 00:00:00 UTC (Consciousness Revolution epoch)
  const GLYPH_EPOCH = new Date('2025-01-01T00:00:00Z').getTime();

  /**
   * Encode a Date to GLYPH timestamp notation
   * Format: YYYY.MM.DD:HH.MM.SS in base-60
   *
   * @param {Date} date - Date to encode (defaults to now)
   * @returns {Object} GLYPH timestamp object
   */
  function encode(date = new Date()) {
    if (!Base60) {
      console.warn('GlyphBase60 not loaded, using decimal fallback');
      return {
        notation: date.toISOString(),
        decimal: date.getTime(),
        session: Math.floor((date.getTime() - GLYPH_EPOCH) / 3600000)
      };
    }

    const year = Base60.fromDecimal(date.getFullYear());
    const month = Base60.fromDecimal(date.getMonth() + 1);
    const day = Base60.fromDecimal(date.getDate());
    const hour = Base60.fromDecimal(date.getHours());
    const min = Base60.fromDecimal(date.getMinutes());
    const sec = Base60.fromDecimal(date.getSeconds());

    // Session ID: hours since GLYPH epoch in base-60
    const hoursSinceEpoch = Math.floor((date.getTime() - GLYPH_EPOCH) / 3600000);
    const sessionId = Base60.fromDecimal(hoursSinceEpoch);

    // Micro-timestamp: milliseconds within current hour
    const microMs = date.getTime() % 3600000;
    const micro = Base60.fromDecimal(microMs);

    return {
      // Full notation: YYYY.MM.DD:HH.MM.SS
      notation: `${year}.${month}.${day}:${hour}.${min}.${sec}`,

      // Components
      year, month, day, hour, min, sec,

      // Session identifier (unique per hour)
      session: sessionId,

      // Micro-precision within hour
      micro: micro,

      // Original decimal values
      decimal: date.getTime(),
      iso: date.toISOString()
    };
  }

  /**
   * Decode GLYPH timestamp notation to Date
   *
   * @param {string} notation - GLYPH timestamp (YYYY.MM.DD:HH.MM.SS in base-60)
   * @returns {Date} Decoded date
   */
  function decode(notation) {
    if (!Base60) {
      console.warn('GlyphBase60 not loaded');
      return new Date(notation);
    }

    // Parse notation: YYYY.MM.DD:HH.MM.SS
    const [datePart, timePart] = notation.split(':');
    if (!datePart) return null;

    const dateParts = datePart.split('.');
    const timeParts = timePart ? timePart.split('.') : ['0', '0', '0'];

    const year = Base60.toDecimal(dateParts[0] || '0');
    const month = Base60.toDecimal(dateParts[1] || '1') - 1; // JS months are 0-indexed
    const day = Base60.toDecimal(dateParts[2] || '1');
    const hour = Base60.toDecimal(timeParts[0] || '0');
    const min = Base60.toDecimal(timeParts[1] || '0');
    const sec = Base60.toDecimal(timeParts[2] || '0');

    return new Date(year, month, day, hour, min, sec);
  }

  /**
   * Get current session ID (hours since GLYPH epoch in base-60)
   * Unique identifier for current hour-long session
   *
   * @returns {string} Base-60 session ID
   */
  function sessionId() {
    const hoursSinceEpoch = Math.floor((Date.now() - GLYPH_EPOCH) / 3600000);

    if (!Base60) {
      return hoursSinceEpoch.toString();
    }

    return Base60.fromDecimal(hoursSinceEpoch);
  }

  /**
   * Get micro-timestamp for event ordering
   * Milliseconds within current hour in base-60
   *
   * @returns {string} Base-60 micro-timestamp
   */
  function micro() {
    const microMs = Date.now() % 3600000;

    if (!Base60) {
      return microMs.toString();
    }

    return Base60.fromDecimal(microMs);
  }

  /**
   * Get unique event ID combining session and micro
   *
   * @returns {string} Unique event identifier
   */
  function eventId() {
    return `${sessionId()}.${micro()}`;
  }

  /**
   * Calculate time difference in base-60
   *
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date (defaults to now)
   * @returns {Object} Time difference in various units
   */
  function diff(date1, date2 = new Date()) {
    const diffMs = Math.abs(date2.getTime() - date1.getTime());

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (!Base60) {
      return { seconds, minutes, hours, days, ms: diffMs };
    }

    return {
      seconds: Base60.fromDecimal(seconds),
      minutes: Base60.fromDecimal(minutes),
      hours: Base60.fromDecimal(hours),
      days: Base60.fromDecimal(days),
      ms: diffMs,
      notation: `${Base60.fromDecimal(days)}d:${Base60.fromDecimal(hours % 24)}h:${Base60.fromDecimal(minutes % 60)}m`
    };
  }

  /**
   * Check if timestamp is from today
   *
   * @param {string|Date} timestamp - Timestamp to check
   * @returns {boolean}
   */
  function isToday(timestamp) {
    const date = typeof timestamp === 'string' ? decode(timestamp) : timestamp;
    const now = new Date();

    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth() &&
           date.getDate() === now.getDate();
  }

  /**
   * Check if timestamp is within last N hours
   *
   * @param {string|Date} timestamp - Timestamp to check
   * @param {number} hours - Number of hours
   * @returns {boolean}
   */
  function isWithinHours(timestamp, hours) {
    const date = typeof timestamp === 'string' ? decode(timestamp) : timestamp;
    const threshold = Date.now() - (hours * 3600000);

    return date.getTime() >= threshold;
  }

  /**
   * Format timestamp for display
   *
   * @param {Date} date - Date to format
   * @param {string} format - 'full', 'date', 'time', 'relative'
   * @returns {string} Formatted timestamp
   */
  function format(date, formatType = 'full') {
    const encoded = encode(date);

    switch (formatType) {
      case 'date':
        return `${encoded.year}.${encoded.month}.${encoded.day}`;

      case 'time':
        return `${encoded.hour}.${encoded.min}.${encoded.sec}`;

      case 'session':
        return encoded.session;

      case 'relative':
        const d = diff(date);
        if (d.ms < 60000) return 'just now';
        if (d.ms < 3600000) return `${d.minutes}m ago`;
        if (d.ms < 86400000) return `${d.hours}h ago`;
        return `${d.days}d ago`;

      case 'full':
      default:
        return encoded.notation;
    }
  }

  // Public API
  return {
    VERSION: '1.0.0',
    EPOCH: GLYPH_EPOCH,

    // Core methods
    encode,
    decode,
    sessionId,
    micro,
    eventId,

    // Utilities
    diff,
    isToday,
    isWithinHours,
    format,

    // Quick access
    now: () => encode(),
    timestamp: () => encode().notation
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphTimestamp;
}
if (typeof window !== 'undefined') {
  window.GlyphTimestamp = GlyphTimestamp;
  window.GlyphTime = GlyphTimestamp; // Alias
}
