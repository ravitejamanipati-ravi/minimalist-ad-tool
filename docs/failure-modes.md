# Failure Modes

Three ways a well-functioning version of this tool causes problems 
in production.

## 1. The scorer encodes my interpretation of the brand, not Minimalist's

The brand rules are derived from public sources (product pages, values 
page, ASCI code). If my interpretation is wrong — I think they avoid a 
word they actually use, or I miss a regulatory nuance specific to their 
product category — the tool confidently rejects good ads or passes bad 
ones.

What I'd do: Before launch, validate the full ruleset with Minimalist's 
actual brand and legal teams. The editable prompts system is built for 
this — a brand reviewer can read and correct every rule without touching 
code. After launch, add a feedback loop where rejected ads can be 
appealed, and appealed-then-approved ads become test cases for rule 
refinement.

When: Before launch.

## 2. Over-reliance reduces human review quality

If the scorer says "Cleared for export," reviewers stop reading the ad 
carefully. The tool becomes a ceiling on quality rather than a floor. 
The expensive version: a legally risky claim passes the scorer because 
the rule didn't anticipate it, and nobody catches it because the green 
checkmark created false confidence.

What I'd do: Never show a binary "approved" state without the reasoning 
behind it. The current design always shows specific checks that ran and 
what they found, even on a passing ad, so the reviewer is reading 
reasons, not just a badge. I would also add periodic "challenge" audits 
where a human reviews a random sample of scorer-approved ads to catch 
systematic blind spots.

When: The UI design is already in place (pre-launch). The audit process 
is post-launch, once there's enough volume to sample meaningfully.

## 3. The generator converges on safe but undifferentiated ads

The generation prompt learns the safe zone (clinical, factual, muted) 
and every ad starts looking the same. Click-through rates drop because 
the ads are compliant but boring. The performance marketing team stops 
using the tool because "it all sounds the same."

What I'd do: Add variation controls that let the marketer choose a 
position on the spectrum between "strictly clinical" and "more 
aspirational" within brand bounds. Track CTR alongside compliance 
scores so the team can see the tradeoff explicitly rather than 
defaulting to maximum safety. The scorer already distinguishes between 
policy (hard rules) and tone/language (soft rules), which is the 
foundation for this flexibility.

When: After launch, once there's real CTR data to calibrate against.