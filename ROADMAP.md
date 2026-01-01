# Roadmap

This document outlines planned features and improvements for the Job Application Autofill Extension.

## Version 1.1 - Resume Parsing Improvements

### LLM-Based Resume Parsing (High Priority)

**Problem:** Current rule-based resume parsing cannot reliably extract work experience and education due to the high variability in resume formats:
- Company name first vs job title first
- Dates inline vs on separate lines
- Project headers that look like job entries
- Multiple roles under one company
- Two-column layouts
- Custom formatting

**Solution:** Integrate LLM (Large Language Model) for semantic resume understanding.

**Implementation Options:**

1. **Claude API Integration**
   - Use Claude Sonnet for cost-effective parsing
   - Send resume text, receive structured JSON
   - Pros: High accuracy, handles any format
   - Cons: Requires API key, costs per parse, privacy considerations

2. **Local LLM (Ollama)**
   - Run a local model like Llama 3 or Mistral
   - Pros: Free, private, offline capable
   - Cons: Requires user to install Ollama, heavier setup

3. **Hybrid Approach (Recommended)**
   - Use rule-based for basic fields (name, email, phone, links)
   - Use LLM only for complex sections (work experience, education)
   - Option for users to choose: "Quick Parse" (rules) vs "AI Parse" (LLM)

**User Flow:**
1. User uploads resume
2. Basic fields extracted instantly (rule-based)
3. User sees option: "Enhance with AI" button
4. If clicked, sends resume to Claude API
5. Returns structured work experience and education
6. User reviews and confirms

**Privacy Considerations:**
- Clear disclosure that resume will be sent to Anthropic
- Option to skip AI parsing and enter manually
- No resume data stored on any server

---

## Version 1.2 - Additional ATS Platforms

### Lever Support
- URL pattern: \`jobs.lever.co/*\`
- Field mapping for Lever form structure

### iCIMS Support
- URL pattern: \`*.icims.com/*\`
- Field mapping for iCIMS forms

### Taleo Support
- URL pattern: \`*.taleo.net/*\`
- Field mapping for Taleo/Oracle forms

---

## Version 2.0 - Major Features

### Generic Website Support
- Auto-fill on non-ATS job application pages
- Use semantic analysis to identify form fields
- Confidence-based suggestions

### Multiple Profiles
- Create different profiles for different industries
- "Software Engineer" profile vs "Product Manager" profile
- Quick profile switching

### Application Tracking
- History of applications submitted
- Status tracking (Applied, Interview, Offer, Rejected)
- Notes and follow-up reminders

### Cross-Browser Support
- Firefox extension
- Edge extension (currently works but not officially supported)
- Safari extension (if demand warrants)

---

## Version 2.1 - Advanced Features

### Cover Letter Generation
- AI-generated cover letters based on job description
- Template customization
- Tone and style options

### Job Description Analysis
- Parse job descriptions to highlight key requirements
- Match against profile to show fit score
- Suggest skills to emphasize

### Password-Based Encryption
- Allow users to set a password for encryption
- More portable data (can decrypt on any browser)
- Recovery options

---

## Future Considerations (No Timeline)

### Team Features
- Share profile templates within teams
- Company-specific field mappings

### Integration with Job Boards
- LinkedIn Easy Apply enhancement
- Indeed integration
- Glassdoor integration

---

## Contributing

If you're interested in contributing to any of these features, please:
1. Check the GitHub Issues for related discussions
2. Open a new issue to discuss your approach before starting work
3. Submit a pull request with your implementation

## Feedback

Have a feature request? Open an issue on GitHub with the "enhancement" label.
