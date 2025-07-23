# Execute NAMC Web PRP

Implement a NAMC NorCal member portal feature using the PRP file. Follow all NAMC-specific business rules, security requirements, and accessibility standards.

## PRP File: $ARGUMENTS

## Execution Process

1. **Load PRP & Context**
   - Read the specified PRP file thoroughly
   - Review CLAUDE.md for NAMC-specific requirements and conventions
   - Understand all business rules, security, and accessibility requirements
   - Check examples/ directory for relevant patterns to follow
   - Follow all instructions in the PRP and extend research if needed
   - Ensure you have all needed context for full NAMC compliance

2. **ULTRATHINK**
   - Think hard before you execute the plan. Create a comprehensive plan addressing all requirements.
   - Break down complex tasks into smaller, manageable steps using your todos tools.
   - Use the TodoWrite tool to create and track your implementation plan.
   - Identify implementation patterns from existing code to follow.

3. **Execute the plan**
   - Execute the PRP
   - Implement all the code

4. **Validate (NAMC Standards)**
   - Run TypeScript checking: `npm run type-check`
   - Run linting: `npm run lint`
   - Run unit tests: `npm test`
   - Test accessibility compliance (WCAG 2.1 AA)
   - Verify responsive design on mobile/tablet/desktop
   - Test role-based access control
   - Fix any failures and re-run until all pass

5. **Complete**
   - Ensure all checklist items done
   - Run final validation suite
   - Report completion status
   - Read the PRP again to ensure you have implemented everything

6. **Reference the PRP**
   - You can always reference the PRP again if needed

Note: If validation fails, use error patterns in PRP to fix and retry.