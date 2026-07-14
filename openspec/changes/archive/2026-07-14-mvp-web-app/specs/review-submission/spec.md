# Review Submission Specification

## Purpose

Verified users MUST be able to submit reviews about agencies they interacted with.

## Requirements

### Requirement: Verified user only

The system MUST reject review submission when the user's phone is not verified.

#### Scenario: Unverified user blocked

- GIVEN a user with phoneVerified=false
- WHEN they submit a review
- THEN the system returns an authorization error

### Requirement: Review field validation

The system MUST validate role (inquilino|propietario), rating (1-5), title (max 100), body (max 1000).

#### Scenario: Invalid rating rejected

- GIVEN a verified user
- WHEN they submit rating 0
- THEN validation fails

### Requirement: Rate limiting

The system MUST allow at most one review per user per agency every 7 days.

#### Scenario: Duplicate review within 7 days

- GIVEN a user who reviewed an agency 2 days ago
- WHEN they submit another review for the same agency
- THEN the system rejects with rate limit error
