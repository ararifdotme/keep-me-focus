# Keep Me Focus

A productivity-focused browser extension to block distracting websites, limit time spent online, and hide content like YouTube Shorts. Includes rule presets, URL pattern matching, and customizable access controls.

## 🎯 Features

### Core Functionality

- 🚫 **Website Blocking**: Complete access blocking to distracting sites
- ⏰ **Time Limiting**: Set daily/hourly time limits for specific websites
- ⏳ **Access Delays**: Add startup delays before accessing distracting sites
- 🎬 **YouTube Shorts Hiding**: Hide YouTube Shorts from feeds and recommendations
- 🔄 **URL Pattern Matching**: Flexible matching with exact, contains, and regex patterns
- 📋 **Rule Presets**: Quick-apply presets for common social media and entertainment sites

### Technical Features

- ✅ **Cross-browser Support**: Chrome & Firefox compatible
- 🧩 **Manifest V3**: Latest standard for Chrome extensions
- ⚙️ **TypeScript**: Strongly typed for better developer experience
- 🎨 **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- 🧱 **Modular Architecture**: Clean separation of concerns with services
- 🔄 **Real-time Content Manipulation**: Dynamic hiding of distracting content
- 🛡️ **Security**: DOMPurify sanitization for all HTML content
- 📱 **Responsive UI**: Mobile-friendly popup and options pages
- 🗂️ **Drag & Drop**: Sortable rule management interface

### Default Configuration

- 📺 **YouTube Shorts Blocking**: Automatically blocks `youtube.com/shorts` URLs
- 👁️ **YouTube Shorts Hiding**: Hides Shorts from YouTube's main interface
- 🎚️ **Quick Toggle**: Easy enable/disable from popup interface

## 📁 Project Structure

```
keep-me-focus/
├── package.json                    # Dependencies and build scripts
├── tsconfig.json                   # TypeScript configuration
├── webpack.config.js               # Webpack build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── LICENSE                         # MIT license
├── README.md                       # This file
├── src/
│   ├── manifest.base.json          # Base manifest template
│   ├── manifest.chrome.json        # Chrome-specific manifest settings
│   ├── manifest.firefox.json       # Firefox-specific manifest settings
│   ├── config/
│   │   ├── storage.ts              # Centralized storage key definitions
│   │   └── presets.ts              # Pre-defined rule configurations
│   ├── html/
│   │   ├── options.html            # Extension options/settings page
│   │   ├── popup.html              # Extension popup interface
│   │   └── alert.html              # Block/limit notification page
│   ├── icons/
│   │   ├── icon.png                # Main extension icon (512x512)
│   │   ├── icon128.png             # Large icon (128x128)
│   │   ├── icon48.png              # Medium icon (48x48)
│   │   └── icon16.png              # Small icon (16x16)
│   ├── scripts/
│   │   ├── background.ts           # Background service worker
│   │   ├── content.ts              # Content script for web page manipulation
│   │   ├── popup.ts                # Popup interface controller
│   │   ├── options.ts              # Options page controller
│   │   └── alert.ts                # Alert page controller
│   ├── services/
│   │   ├── rulesService.ts         # Site rules management
│   │   ├── uiService.ts            # UI management and rendering
│   │   ├── formService.ts          # Form validation and handling
│   │   ├── detectUrlChangeService.ts # SPA navigation detection
│   │   └── schedulerService.ts     # Task scheduling utilities
│   ├── types/
│   │   ├── SiteRule.ts             # Site rule type definitions
│   │   ├── PresetRule.ts           # Preset rule interfaces
│   │   └── Popup.ts                # Popup interface types
│   ├── utils/
│   │   ├── siteRulesMatcher.ts     # URL pattern matching utilities
│   │   └── assertNever.ts          # TypeScript exhaustiveness helper
│   └── styles/
│       └── main.css                # Main stylesheet with Tailwind directives
└── dist/                           # Build output directory
    ├── chrome/                     # Chrome extension build
    └── firefox/                    # Firefox extension build
```

## 🛠️ Build Requirements

### Operating System

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.14 (Mojave) or later
- **Linux**: Ubuntu 18.04 LTS or later, or equivalent distributions

### Required Software

#### Node.js and npm

- **Node.js**: Version 16.0.0 or higher (LTS recommended)
- **npm**: Version 8.0.0 or higher (comes with Node.js)

**Installation:**

```bash
# Check current versions
node --version
npm --version

# Install Node.js from https://nodejs.org/
# Or using package managers:

# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Git (Optional, for cloning)

- **Git**: Version 2.20.0 or higher

```bash
# Install Git
# Windows: Download from https://git-scm.com/
# macOS: xcode-select --install
# Ubuntu/Debian: sudo apt-get install git
```

## 🚀 Getting Started

### Step 1: Clone or Download the Repository

```bash
# Option 1: Clone with Git
git clone <repository-url>
cd keep-me-focus

# Option 2: Download and extract ZIP file
# Then navigate to the extracted folder
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
```

This will install:

- TypeScript compiler and type definitions
- Webpack and related build tools
- Tailwind CSS and PostCSS
- DOMPurify for security
- Sortable.js for drag-and-drop functionality
- webextension-polyfill for cross-browser compatibility

### Step 3: Development Build

#### Chrome Development (with hot reload)

```bash
npm run dev:chrome
```

#### Firefox Development (with hot reload)

```bash
npm run dev:firefox
```

The development builds will:

- Watch for file changes and rebuild automatically
- Generate source maps for debugging
- Output to `dist/chrome/` or `dist/firefox/`

### Step 4: Production Build

#### Chrome Production Build

```bash
npm run build:chrome
```

#### Firefox Production Build

```bash
npm run build:firefox
```

Production builds will:

- Minify and optimize all code
- Remove development dependencies
- Generate production-ready extension packages

## 📦 Loading the Extension

### Chrome Installation

1. **Build the extension:**

   ```bash
   npm run build:chrome
   ```

2. **Open Chrome Extensions page:**

   - Navigate to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

3. **Enable Developer Mode:**

   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension:**

   - Click "Load unpacked"
   - Select the `dist/chrome/` folder
   - The extension will appear in your extensions list

5. **Pin the extension (recommended):**
   - Click the puzzle piece icon in the toolbar
   - Click the pin icon next to "Keep Me Focus"

### Firefox Installation

1. **Build the extension:**

   ```bash
   npm run build:firefox
   ```

2. **Open Firefox Add-ons Debug page:**

   - Navigate to `about:debugging#/runtime/this-firefox`
   - Or: Menu → More Tools → Web Developer Tools → about:debugging

3. **Load temporary add-on:**

   - Click "Load Temporary Add-on..."
   - Navigate to `dist/firefox/`
   - Select the `manifest.json` file

4. **The extension will be loaded temporarily** (until Firefox restarts)

## 🎛️ Available Scripts

| Script                  | Description                                   | Output          |
| ----------------------- | --------------------------------------------- | --------------- |
| `npm run dev:chrome`    | Development build for Chrome with watch mode  | `dist/chrome/`  |
| `npm run dev:firefox`   | Development build for Firefox with watch mode | `dist/firefox/` |
| `npm run build:chrome`  | Production build for Chrome                   | `dist/chrome/`  |
| `npm run build:firefox` | Production build for Firefox                  | `dist/firefox/` |
| `npm run clean`         | Clean build artifacts                         | Removes `dist/` |

## 🔧 Configuration

### Rule Presets

The extension comes with pre-configured rule presets in `src/config/presets.ts`:

- **block-youtube-shorts**: Blocks access to YouTube Shorts pages
- **limit-youtube**: Limits YouTube to 10 minutes per hour with 60-minute startup delay
- **block-social-media**: Blocks Facebook, Instagram, Twitter/X, TikTok
- **limit-social-media**: Limits social media to 15 minutes daily
- **delay-distractions**: Adds 10-minute delays to distracting sites

### Default Settings

New installations automatically enable:

- ✅ **Hide YouTube Shorts**: Content script hiding
- ✅ **Block YouTube Shorts**: URL blocking rule

### Customization

You can modify presets and default settings by editing:

- `src/config/presets.ts` - Rule presets
- `src/scripts/background.ts` - Default installation settings
- `src/scripts/popup.ts` - Default popup settings

## 🛡️ Security Features

- **DOMPurify Integration**: All HTML content is sanitized to prevent XSS attacks
- **Content Security Policy**: Strict CSP in manifest prevents unsafe evaluations
- **Input Validation**: All user inputs are validated and escaped
- **Secure Storage**: Uses browser's sync storage with appropriate permissions

## 🧪 Browser Compatibility

### Chrome

- **Minimum Version**: Chrome 88+ (Manifest V3 support)
- **Recommended**: Chrome 100+
- **APIs Used**: chrome.storage, chrome.runtime, chrome.tabs

### Firefox

- **Minimum Version**: Firefox 109+ (Manifest V3 support)
- **Recommended**: Firefox 115+
- **APIs Used**: browser.storage, browser.runtime, browser.tabs

## 📝 Usage Guide

### Adding Custom Rules

1. **Open Options Page:**

   - Right-click extension icon → Options
   - Or: Chrome Extensions → Keep Me Focus → Details → Extension Options

2. **Create Rule:**

   - Fill in rule title (e.g., "Block Reddit")
   - Enter URL pattern (e.g., "reddit.com")
   - Select match type (Contains, Exact, Regex)
   - Choose action (Allow, Block, Limit)
   - Click "Add Rule"

3. **Rule Types:**
   - **Allow**: Explicitly allow access (overrides other rules)
   - **Block**: Completely block access with alert page
   - **Limit**: Set time limits and startup delays

### Using Presets

1. **In Options Page:**
   - Scroll to "Quick Presets" section
   - Click any preset button to load it into the form
   - Modify if needed, then click "Add Rule"

### Managing Rules

- **Enable/Disable**: Toggle checkbox next to each rule
- **Edit**: Click edit icon to modify existing rules
- **Delete**: Click delete icon to remove rules
- **Reorder**: Drag and drop rules to change priority

## 🔍 Troubleshooting

### Build Issues

**Problem**: `npm install` fails

```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: TypeScript compilation errors

```bash
# Check TypeScript version
npx tsc --version
# Should be 4.0.0 or higher

# Rebuild with verbose output
npm run build:chrome -- --verbose
```

**Problem**: Webpack build fails

```bash
# Clear webpack cache
rm -rf node_modules/.cache
npm run build:chrome
```

### Extension Loading Issues

**Chrome**: Extension not loading

- Ensure Developer Mode is enabled
- Check for errors in `chrome://extensions/`
- Verify manifest.json exists in build folder

**Firefox**: Temporary add-on not working

- Check for errors in `about:debugging`
- Ensure manifest.json is valid
- Try reloading the temporary add-on

### Runtime Issues

**Rules not working**:

- Check if extension has necessary permissions
- Verify content script is loading on target sites
- Check browser console for errors

**UI not responding**:

- Clear extension storage: Options → Reset/Clear Data
- Reload extension and try again

## 🤝 Development

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configuration in package.json
- **Prettier**: Code formatting (recommended)

### Architecture

- **Services**: Business logic and data management
- **Controllers**: UI interaction handling
- **Types**: TypeScript interfaces and enums
- **Utils**: Reusable utility functions

### Adding New Features

1. **Create types** in `src/types/`
2. **Implement service** in `src/services/`
3. **Update UI** in relevant script files
4. **Add tests** (if applicable)
5. **Update documentation**

## Build Checklist

For reviewers and developers, here's a complete build checklist:

### Prerequisites Verification

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] Git installed (optional, `git --version`)

### Build Process

1. [ ] Clone/download source code
2. [ ] Navigate to project directory
3. [ ] Run `npm install` (installs all dependencies)
4. [ ] Run `npm run build:chrome` or `npm run build:firefox`
5. [ ] Verify output in `dist/[browser]/` directory
6. [ ] Load extension in browser following installation instructions

### Verification

- [ ] Extension loads without errors
- [ ] Popup opens and displays toggles
- [ ] Options page accessible and functional
- [ ] Site blocking rules work as expected
- [ ] No console errors in browser developer tools

## 📄 License

[MIT License](./LICENSE)

## 👨‍💻 Author

Made with ❤️ by [A R Arif](https://ararif.me)
