# Prediction Logic

ShopSense uses a deterministic, rule-based algorithm to predict UX friction. It does not use Machine Learning.

## Friction Calculation

Friction is calculated per session based on three primary factors:

1. **Back Navigations:** Each back navigation event adds 10 points (up to a max of 30).
2. **Cart Changes:** Each quantity modification adds 5 points (up to a max of 25).
3. **Form Interactions:** Checkout form interactions beyond 4 add 5 points each (up to a max of 25).

## Friction Levels

The total friction score is mapped to one of three levels:
- **LOW:** Score ≤ 30
- **MEDIUM:** 30 < Score ≤ 70
- **HIGH:** Score > 70

These heuristics identify users who are likely struggling with the UI.
