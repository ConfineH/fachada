# User Auth Specification

## Purpose

Users MUST register and verify their Spanish mobile phone via SMS before writing reviews.

## Requirements

### Requirement: Spanish phone format

The system MUST accept phone numbers in +34 format.

#### Scenario: Valid Spanish mobile

- GIVEN phone +34600123456
- WHEN user requests verification code
- THEN a 6-digit code is sent via SMS provider

### Requirement: Code verification

The system MUST mark phoneVerified=true only after correct 6-digit code.

#### Scenario: Correct code

- GIVEN a pending verification for +34600123456
- WHEN user submits the correct code
- THEN phoneVerified becomes true and session is created

#### Scenario: Wrong code

- GIVEN a pending verification
- WHEN user submits wrong code
- THEN verification fails and phoneVerified stays false
