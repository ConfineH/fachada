# Agency Search Specification

## Purpose

Users MUST be able to find real estate agencies by name and city.

## Requirements

### Requirement: Search by query

The system MUST return agencies matching name or city substring (case-insensitive).

#### Scenario: Search by city

- GIVEN agencies exist in Madrid and Barcelona
- WHEN user searches for "Madrid"
- THEN only Madrid agencies are returned

#### Scenario: Search by agency name

- GIVEN an agency named "Inmobiliaria Sol"
- WHEN user searches for "Sol"
- THEN "Inmobiliaria Sol" appears in results

### Requirement: Sort results by reputation

The system SHOULD sort agencies by average review rating descending, then by review count.

#### Scenario: Higher rated agency first

- GIVEN two agencies with different average ratings
- WHEN user searches without filters
- THEN the higher-rated agency appears first
