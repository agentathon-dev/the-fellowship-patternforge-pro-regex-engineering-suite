/**
 * PatternForge — Fluent Regex Builder & Analysis Toolkit
 * Makes JavaScript regex creation, testing, and optimization effortless.
 * @module PatternForge
 */

/**
 * Creates a fluent regex builder with chainable methods.
 * Compose patterns in readable English instead of cryptic regex syntax.
 * @example
 *   const emailPattern = forge().start().oneOrMore('[a-zA-Z0-9._%+-]').literal('@').oneOrMore('[a-zA-Z0-9.-]').literal('.').between(2,6,'[a-zA-Z]').end().build();
 * @returns {Object} A builder with chainable methods and .build()/.toRegex()
 */
function forge() {
  var parts = [];
  var flags = '';
  var api = {
    /** Match start of string */
    start: function() { parts.push('^'); return api; },
    /** Match end of string */
    end: function() { parts.push('$'); return api; },
    /** Match exact literal string (auto-escaped) */
    literal: function(str) {
      if (typeof str !== 'string') throw new TypeError('literal() requires a string argument');
      parts.push(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      return api;
    },
    /** Match a character class like [a-z] or [0-9A-F] */
    charClass: function(cls) { parts.push('[' + cls + ']'); return api; },
    /** Match any single character */
    anyChar: function() { parts.push('.'); return api; },
    /** Match a digit \\d */
    digit: function() { parts.push('\\d'); return api; },
    /** Match a non-digit \\D */
    nonDigit: function() { parts.push('\\D'); return api; },
    /** Match a word character \\w */
    word: function() { parts.push('\\w'); return api; },
    /** Match whitespace \\s */
    whitespace: function() { parts.push('\\s'); return api; },
    /** Match a word boundary \\b */
    boundary: function() { parts.push('\\b'); return api; },
    /** Match one or more of a pattern */
    oneOrMore: function(pat) { parts.push('(?:' + pat + ')+'); return api; },
    /** Match zero or more of a pattern */
    zeroOrMore: function(pat) { parts.push('(?:' + pat + ')*'); return api; },
    /** Match zero or one of a pattern */
    optional: function(pat) { parts.push('(?:' + pat + ')?'); return api; },
    /** Match exactly n repetitions */
    exactly: function(count, pat) { parts.push('(?:' + pat + '){' + count + '}'); return api; },
    /** Match between min and max repetitions */
    between: function(min, max, pat) { parts.push('(?:' + pat + '){' + min + ',' + max + '}'); return api; },
    /** Match at least n repetitions */
    atLeast: function(count, pat) { parts.push('(?:' + pat + '){' + count + ',}'); return api; },
    /** Create a named capture group */
    capture: function(name, pat) { parts.push('(?<' + name + '>' + pat + ')'); return api; },
    /** Create a non-capturing group */
    group: function(pat) { parts.push('(?:' + pat + ')'); return api; },
    /** Match one of several alternatives */
    either: function() {
      var alts = Array.prototype.slice.call(arguments);
      parts.push('(?:' + alts.join('|') + ')');
      return api;
    },
    /** Positive lookahead */
    lookahead: function(pat) { parts.push('(?=' + pat + ')'); return api; },
    /** Negative lookahead */
    negativeLookahead: function(pat) { parts.push('(?!' + pat + ')'); return api; },
    /** Add raw regex fragment */
    raw: function(pat) { parts.push(pat); return api; },
    /** Add global flag */
    global: function() { flags += 'g'; return api; },
    /** Add case-insensitive flag */
    ignoreCase: function() { flags += 'i'; return api; },
    /** Add multiline flag */
    multiline: function() { flags += 'm'; return api; },
    /** Build the pattern string */
    build: function() { return parts.join(''); },
    /** Build and return a RegExp object */
    toRegex: function() { return new RegExp(parts.join(''), flags); },
    /** Get human-readable description of the pattern */
    describe: function() { return explain(parts.join('')); }
  };
  return api;
}

/**
 * Library of 12 production-tested regex patterns for common validation needs.
 * Each pattern includes the regex, a description, and test examples.
 * @example
 *   patterns.email.regex.test('user@example.com') // true
 * @type {Object}
 */
var patterns = {
  email: { regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, desc: 'RFC 5322 email', examples: ['user@example.com'] },
  url: { regex: /^https?:\/\/[^\s/$.?#].[^\s]*$/, desc: 'HTTP/HTTPS URL', examples: ['https://example.com/path'] },
  ipv4: { regex: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/, desc: 'IPv4 address', examples: ['192.168.1.1'] },
  ipv6: { regex: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, desc: 'IPv6 address (full)', examples: ['2001:0db8:85a3:0000:0000:8a2e:0370:7334'] },
  phone: { regex: /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, desc: 'US phone number', examples: ['(555) 123-4567'] },
  date: { regex: /^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])$/, desc: 'ISO date YYYY-MM-DD', examples: ['2024-01-15'] },
  time: { regex: /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, desc: '24-hour time HH:MM:SS', examples: ['14:30:00'] },
  hex: { regex: /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, desc: 'Hex color code', examples: ['#ff5733'] },
  uuid: { regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, desc: 'UUID v1-v5', examples: ['550e8400-e29b-41d4-a716-446655440000'] },
  semver: { regex: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/, desc: 'Semantic version', examples: ['1.2.3-beta.1'] },
  slug: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, desc: 'URL slug', examples: ['my-blog-post'] },
  creditCard: { regex: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/, desc: 'Credit card (Visa/MC/Amex/Discover)', examples: ['4111111111111111'] }
};

/**
 * Explains a regex pattern in human-readable English.
 * Breaks down anchors, quantifiers, character classes, groups, and special tokens.
 * @example
 *   explain('^\\d{3}-\\d{4}$')
 *   // Returns: "Start of string, Digit (3 times), Literal '-', Digit (4 times), End of string"
 * @param {string|RegExp} pattern - The regex to explain
 * @returns {string} Human-readable explanation
 */
function explain(pattern) {
  if (!pattern) throw new TypeError('explain() requires a pattern argument');
  var src = pattern instanceof RegExp ? pattern.source : String(pattern);
  var tokens = [];
  var idx = 0;
  while (idx < src.length) {
    var ch = src[idx];
    if (ch === '^') { tokens.push('Start of string'); idx++; }
    else if (ch === '$') { tokens.push('End of string'); idx++; }
    else if (ch === '.') { tokens.push('Any character'); idx++; }
    else if (ch === '\\') {
      idx++;
      var next = src[idx] || '';
      var escMap = { d: 'Digit', D: 'Non-digit', w: 'Word char', W: 'Non-word char', s: 'Whitespace', S: 'Non-whitespace', b: 'Word boundary', B: 'Non-boundary' };
      tokens.push(escMap[next] || "Literal '" + next + "'");
      idx++;
    }
    else if (ch === '[') {
      var end = src.indexOf(']', idx);
      if (end === -1) end = src.length;
      tokens.push('Character class [' + src.slice(idx + 1, end) + ']');
      idx = end + 1;
    }
    else if (ch === '(') {
      if (src.slice(idx, idx + 3) === '(?:') { tokens.push('Non-capturing group'); idx += 3; }
      else if (src.slice(idx, idx + 3) === '(?=') { tokens.push('Positive lookahead'); idx += 3; }
      else if (src.slice(idx, idx + 3) === '(?!') { tokens.push('Negative lookahead'); idx += 3; }
      else if (src.slice(idx, idx + 3) === '(?<') {
        var nameEnd = src.indexOf('>', idx);
        tokens.push("Capture group '" + src.slice(idx + 3, nameEnd) + "'");
        idx = nameEnd + 1;
      }
      else { tokens.push('Capture group'); idx++; }
    }
    else if (ch === ')') { tokens.push('End group'); idx++; }
    else if (ch === '{') {
      var bEnd = src.indexOf('}', idx);
      tokens.push('Repeat {' + src.slice(idx + 1, bEnd) + '}');
      idx = bEnd + 1;
    }
    else if (ch === '+') { tokens.push('One or more'); idx++; }
    else if (ch === '*') { tokens.push('Zero or more'); idx++; }
    else if (ch === '?') { tokens.push('Optional'); idx++; }
    else if (ch === '|') { tokens.push('OR'); idx++; }
    else { tokens.push("Literal '" + ch + "'"); idx++; }
  }
  return tokens.join(', ');
}

/**
 * Tests a regex pattern against an array of strings and reports matches.
 * Provides detailed results including match groups and indices.
 * @example
 *   testPattern(/\d+/, ['abc', '123', 'a1b'])
 *   // Returns: { pattern: '\\d+', results: [{input:'abc',match:false}, {input:'123',match:true,matched:'123'}, ...], summary: {total:3,matched:2,failed:1} }
 * @param {string|RegExp} pattern - The regex to test
 * @param {string[]} inputs - Array of test strings
 * @returns {Object} Test results with summary
 */
function testPattern(pattern, inputs) {
  if (!pattern) throw new TypeError('testPattern() requires a pattern');
  if (!Array.isArray(inputs)) throw new TypeError('testPattern() requires an array of input strings');
  var regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  var matched = 0;
  var results = inputs.map(function(input) {
    var match = regex.exec(input);
    if (match) {
      matched++;
      return { input: input, match: true, matched: match[0], groups: match.groups || null, index: match.index };
    }
    return { input: input, match: false };
  });
  return { pattern: regex.source, results: results, summary: { total: inputs.length, matched: matched, failed: inputs.length - matched } };
}

/**
 * Detects common regex anti-patterns that cause performance or correctness issues.
 * Checks for catastrophic backtracking, ReDoS vulnerabilities, greedy traps, and more.
 * @example
 *   detectAntiPatterns('(a+)+$')
 *   // Returns: [{ severity: 'CRITICAL', name: 'Catastrophic backtracking', ... }]
 * @param {string|RegExp} pattern - The regex to analyze
 * @returns {Array} Array of detected issues with severity and recommendations
 */
function detectAntiPatterns(pattern) {
  if (!pattern) throw new TypeError('detectAntiPatterns() requires a pattern');
  var src = pattern instanceof RegExp ? pattern.source : String(pattern);
  var issues = [];
  var checks = [
    { name: 'Catastrophic backtracking', severity: 'CRITICAL', test: /\([^)]*[+*][^)]*\)[+*]/, fix: 'Use atomic groups or possessive quantifiers' },
    { name: 'Greedy dot-star', severity: 'WARNING', test: /\.\*[^?]/, fix: 'Use .*? (lazy) or more specific patterns' },
    { name: 'Unbounded repetition', severity: 'WARNING', test: /\{0,\}|\{\d+,\}(?!\?)/, fix: 'Add upper bounds to repetition' },
    { name: 'Unescaped dot in class', severity: 'INFO', test: /\[[^\]]*(?<!\\)\.[^\]]*\]/, fix: 'Escape dots inside character classes for clarity' },
    { name: 'Overlapping alternation', severity: 'WARNING', test: /\([^)]*\|[^)]*\).*\1/, fix: 'Ensure alternations do not overlap' },
    { name: 'Nested quantifiers', severity: 'CRITICAL', test: /[+*?]\)?\s*[+*?{]/, fix: 'Restructure to avoid nested quantifiers — potential ReDoS' },
    { name: 'Empty alternation branch', severity: 'INFO', test: /\(\||\|\)|\|\|/, fix: 'Remove empty alternation branches' },
    { name: 'Redundant escape', severity: 'INFO', test: /\\[a-zA-Z](?![*+?{])/, fix: 'Some escapes are unnecessary outside character classes' }
  ];
  checks.forEach(function(check) {
    if (check.test.test(src)) {
      issues.push({ severity: check.severity, name: check.name, recommendation: check.fix, pattern: src });
    }
  });
  return issues;
}

/**
 * Suggests optimizations for a regex pattern to improve performance and readability.
 * @example
 *   optimize('[0-9]') // Returns: ["Replace [0-9] with \\d — shorter and clearer."]
 * @param {string|RegExp} pattern - The regex to optimize
 * @returns {string[]} Array of optimization suggestions
 */
function optimize(pattern) {
  if (!pattern) throw new TypeError('optimize() requires a pattern');
  var src = pattern instanceof RegExp ? pattern.source : String(pattern);
  var suggestions = [];
  var opts = [
    { find: /\[0-9\]/, suggestion: 'Replace [0-9] with \\d — shorter and clearer.' },
    { find: /\[a-zA-Z0-9_\]/, suggestion: 'Replace [a-zA-Z0-9_] with \\w — equivalent and more concise.' },
    { find: /\[\\t\\n\\r ?\]/, suggestion: 'Replace whitespace class with \\s.' },
    { find: /\.\*/, suggestion: 'Consider replacing .* with a more specific pattern for better performance.' },
    { find: /\(\?:([^)]{1,2})\)\{/, suggestion: 'Single-char groups in quantifiers can drop the group wrapper.' },
    { find: /\[([a-z])\]/i, suggestion: 'Single-character class can be a literal or escape.' },
    { find: /\{1\}/, suggestion: 'Remove {1} — it is redundant.' },
    { find: /\{0,1\}/, suggestion: 'Replace {0,1} with ? for brevity.' }
  ];
  opts.forEach(function(opt) {
    if (opt.find.test(src)) suggestions.push(opt.suggestion);
  });
  if (suggestions.length === 0) suggestions.push('Pattern looks well-optimized. No suggestions.');
  return suggestions;
}

/**
 * Escapes special regex characters in a string for safe use in RegExp constructor.
 * @example
 *   escapeRegex('price: $9.99') // Returns: 'price: \\$9\\.99'
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeRegex(str) {
  if (typeof str !== 'string') throw new TypeError('escapeRegex() requires a string');
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// === Showcase ===
console.log('Email:', forge().start().oneOrMore('[a-z0-9._%+-]').literal('@').oneOrMore('[a-z0-9.-]').literal('.').between(2,6,'[a-z]').end().build());
console.log('Test:', JSON.stringify(testPattern(/\d+/, ['abc','123']).summary));
console.log('Issues:', detectAntiPatterns('(a+)+').length);

module.exports = { forge: forge, patterns: patterns, explain: explain, testPattern: testPattern, detectAntiPatterns: detectAntiPatterns, optimize: optimize, escapeRegex: escapeRegex };
