# Live Demo Script

## Positioning

This demo shows how a trust firm can monitor transactions for objective FIU-reporting triggers and route flagged cases to an internal review workflow before preparing a report package.

The practical scenario is a client transfer above Afl. 500,000 that should be flagged for MLCO/compliance review.

## Suggested opening

“Today I will show a simplified transaction monitoring workflow for a trust-firm environment. The key point is not only detecting a transaction above a threshold, but also showing how the alert becomes a reviewable case with supporting information for a potential FIU report.”

## Demo flow

### 1. Start on the Dashboard

Show the summary cards:
- Total transactions
- Flagged transfers
- Final approved / cleared items
- FIU package readiness

Explain that this is a simulated environment with trust-client data.

### 2. Show the Rule Manager

Open Rule Manager and point out the rule:

- Giro / cashless transfer of Afl. 500,000 or more
- Flag for compliance review
- Route to FIU package workflow if confirmed

Suggested wording:

“This rule reflects the objective monitoring trigger we want the system to capture automatically. The system should not rely on someone remembering the threshold manually.”

### 3. Inject a 500k+ transaction

Use the inject button to create a new high-value transfer.

Then explain:

“The system immediately flags this as a reportable indicator candidate. At this stage, it is not yet a final report. It becomes a compliance review case.”

### 4. Open the transaction details

Show:
- Client
- Amount
- Route/jurisdiction
- UBO/director references
- FIU decision status
- Package checklist

Suggested wording:

“This is where the compliance officer sees the essential information needed for review: who is involved, what happened, amount, timing, and why the system flagged it.”

### 5. Move to Manual Review

Open Manual Review.

Show the decision options:
- Draft FIU
- No report
- Reviewed

Suggested wording:

“Compliance can document the decision. If the transaction is objectively reportable, the system can prepare the report package. If there are reasons why it is not reportable, that decision is documented.”

### 6. Open FIU report package

Click the FIU package button.

Explain:

“The package is structured to support reporting, but it does not submit anything automatically in this demo. This is important: the system supports compliance judgment, it does not replace it.”

### 7. Export CSV

Show CSV export from Transactions.

Suggested wording:

“The same data can also be exported for audit trail, management review, or evidence to regulators.”

## Closing message

“The value of this kind of monitoring is consistency. Every transfer above the defined threshold is detected, routed, reviewed, and documented. That reduces dependency on manual memory, improves timeliness, and creates a stronger compliance audit trail.”
