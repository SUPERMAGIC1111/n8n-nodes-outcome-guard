# Changelog

## 0.1.1

- Fixed: "Response Has Hidden Error" wrongly matched inside harmless field names (e.g. `"errorCount": 0` was flagged as a failure just because it contains "error"). Plain keywords now match on word boundaries; punctuation-based patterns like `"success":false` still match as literal substrings.
- Fixed: the hidden-error message now shows the keyword exactly as typed, instead of a whitespace-normalized version.
- Added: **Case Insensitive** option for "Field Equals" and "Re-Fetch URL and Check Field" — off by default (no behavior change), opt in when an API returns inconsistent casing like "Confirmed" vs "confirmed".
- Changed: whitespace around compared values is now always trimmed — incidental spacing from an API should never be the reason a check fails.

## 0.1.0

- Initial prototype: four check types (Field Exists, Field Equals, Response Has Hidden Error, Re-Fetch URL and Check Field), verified live against a running n8n instance.
