Now perform a SELF-REVIEW of the code you just generated.

STRICT REVIEW RULES:
You must check your own output against the following architectural rules.
Do NOT modify code yet.
Do NOT explain the code.
ONLY report PASS / FAIL for each item, with a short reason.

CHECKLIST:

1. Controller responsibility
❓ Does any Controller contain business logic related to:
   - quota checking
   - subscription validation
   - post status decision
❌ If YES → FAIL
✅ If Controller only handles request/response → PASS

2. Repository responsibility
❓ Does any Repository contain logic related to:
   - checking post status
   - checking subscription validity
   - permission or quota rules
❌ If YES → FAIL
✅ If Repository only queries or persists data → PASS

3. Service transaction handling
❓ Does the Service layer:
   - wrap Post creation AND quota deduction in ONE transaction?
❌ If NO → FAIL
✅ If YES → PASS

4. DTO purity
❓ Do any DTOs contain:
   - DataAnnotations
   - Validation attributes
   - Business logic
❌ If YES → FAIL
✅ If DTOs are pure data contracts → PASS

5. Entity immutability
❓ Were any Entity classes modified beyond database-mapped properties?
❌ If YES → FAIL
✅ If Entities remain pure DB models → PASS

OUTPUT FORMAT (MANDATORY):

- Controller logic: PASS / FAIL – reason
- Repository logic: PASS / FAIL – reason
- Service transaction: PASS / FAIL – reason
- DTO purity: PASS / FAIL – reason
- Entity integrity: PASS / FAIL – reason

If ANY item FAILS:
- Clearly state which layer violated the rule
- Do NOT attempt to fix unless explicitly asked
