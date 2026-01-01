# Job Application Autofill Extension

A browser extension that securely stores your job application data and automatically fills forms across multiple ATS (Applicant Tracking System) platforms.

## Features

- **One-time profile setup**: Enter your information once, use it everywhere
- **Multi-platform support**: Works with Workday and Greenhouse (more coming)
- **Smart field detection**: Automatically identifies and maps form fields
- **Supplement, not override**: Only fills empty fields, preserving your manual entries
- **Privacy-first**: All data encrypted with AES-256-GCM and stored locally
- **Resume parsing**: Extract profile data from PDF, DOCX, or TXT resumes
- **Export/Import**: Back up your profile or transfer between devices

## Supported Platforms

| Platform | Status | Detection |
|----------|--------|-----------|
| Workday | Supported | `*.myworkdayjobs.com` |
| Greenhouse | Supported | `boards.greenhouse.io/*` |
| Lever | Coming Soon | - |
| iCIMS | Coming Soon | - |

## Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-application-autofill-extension.git
   cd job-application-autofill-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in browser**
   - **Brave/Chrome/Edge**:
     1. Go to `brave://extensions`, `chrome://extensions`, or `edge://extensions`
     2. Enable "Developer mode" (toggle in top-right)
     3. Click "Load unpacked"
     4. Select the `dist/` folder

## Usage

### Initial Setup

1. Click the extension icon in your browser toolbar
2. Click "Set Up Profile" to open the options page
3. Fill in your information:
   - Personal details (name, email, phone, address)
   - Professional links (LinkedIn, GitHub, portfolio)
   - Work authorization status
   - Voluntary self-identification (optional)
4. Click "Save Profile"

### Using Autofill

1. Navigate to a supported job application page
2. The extension icon will turn green and show the platform badge (WD/GH)
3. A floating indicator button appears on the page
4. Click the floating indicator OR open the popup and click "Autofill This Page"
5. Watch as your information is filled in automatically

### Export/Import Profile

**Export:**
1. Click the extension icon
2. Click "Export" to download your profile as JSON

**Import:**
1. Click the extension icon
2. Click "Import" and select your JSON file

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build
```

### Project Structure

```
src/
├── background/       # Service worker (badge updates, message routing)
├── content/          # Content scripts (ATS detection, autofill logic)
├── options/          # Options/settings page (React)
├── popup/            # Extension popup (React)
├── components/       # Shared UI components (shadcn/ui)
├── utils/            # Utilities (storage, encryption, validation)
└── types/            # TypeScript type definitions

tests/
├── fixtures/         # Mock HTML pages for testing
└── e2e/              # Playwright E2E tests
```

### Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite + crxjs/vite-plugin
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Testing**: Vitest + Playwright
- **Storage**: Chrome Storage API with AES-256-GCM encryption

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Manual Testing

See [TESTING.md](./TESTING.md) for comprehensive manual testing checklists.

## Security

- **Local storage only**: Your data never leaves your device
- **AES-256-GCM encryption**: All sensitive data encrypted at rest
- **No external requests**: The extension works entirely offline
- **Open source**: Full transparency in how your data is handled

## Privacy

This extension:
- Does NOT send your data to any server
- Does NOT track your browsing activity
- Does NOT share data with third parties
- Stores everything locally in your browser

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Extension not detecting job page

- Ensure you're on a supported platform (Workday or Greenhouse)
- Try refreshing the page
- Check that the extension is enabled in your browser

### Fields not filling correctly

- Some ATS platforms have custom field implementations
- Use "Copy Debug Info" in Settings to report issues
- Check if the field was already filled (extension won't override)

### Data not saving

- Check browser storage permissions
- Try clearing extension data and re-entering

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [crxjs](https://crxjs.dev/vite-plugin/) for Chrome extension Vite integration
