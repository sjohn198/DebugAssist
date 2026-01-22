### Chat Output Requirements Brainstorming
- Errors
    - Default enabled
    - Mode to include error reason (user may want to figure out on their own)
- Optimizations
    - Default disabled
    - Would want the most thorough explanation, because these can be the most complicated
- Style Issues
    - Default disabled
    - Modes for different standards

General Notes:
- Most important: Take advantage of structured outputs provided by Responses API!!!
    - But this changes based on mode
- All are returned as line text, line # pairs
    - Should prob have support for multiple lines
- Need a modular system instructions for the Responses API that depends on what the user selects
- Maybe send the system instructions with each prompt.
