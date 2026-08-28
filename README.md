# DSA Stopwatch ⏱️

**A free Safari extension for tracking how long you spend solving
DSA and LeetCode problems.**

DSA Stopwatch helps you measure your coding practice time with a
built-in stopwatch, session history, daily practice tracking, and
CSV export.

Perfect for:

- LeetCode practice
- Data Structures & Algorithms preparation
- Coding interview preparation
- Competitive programming
- Tracking daily coding practice

[Installation](#installation) · [Features](#features) · [Build](#building)
---

## ✨ Features

- ⏱️ Start and stop a stopwatch for a DSA problem
- 📝 Track the current problem/session
- 💾 Store session information locally using browser storage
- 🔔 Background timing using a service worker
- 📊 Session history
- 📁 CSV export *(currently under development)*
- 🧩 Native Safari Web Extension
- 🍎 Works with Safari on macOS
- 🚀 Can be built using GitHub Actions without installing Xcode locally

---

## 🖥️ Requirements

### For users

You need:

- macOS
- Safari
- Safari Developer settings enabled
- "Allow unsigned extensions" enabled

You **do not need Xcode** to install the pre-built application from the GitHub Actions artifact.

### For developers

If you want to modify and build the extension yourself:

- macOS GitHub Actions runner
- GitHub account
- Git
- A code editor such as VS Code

Xcode does not need to be installed on your local Mac if you use the included GitHub Actions workflow.

---

# 🚀 Installation

There are two ways to use DSA Stopwatch.

## Method 1 — Install the pre-built application

This is the easiest method.

### Step 1 — Download the latest build

Go to the repository's:

**GitHub → Actions → Build Safari Extension**

Open the latest successful workflow run.

Under **Artifacts**, download:

```text
DSAStopwatch-macOS-app
```

GitHub will download a ZIP file.

---

### Step 2 — Extract the application

Extract the downloaded ZIP.

You should get:

```text
DSA Stopwatch.app
```

Move it to:

```text
/Applications
```

Your final path should be:

```text
/Applications/DSA Stopwatch.app
```

---

# 🛠️ Enable Safari Developer Settings

Safari normally does not allow unsigned development extensions.

You need to enable this manually.

### Step 1

Open Safari.

Go to:

```text
Safari → Settings → Developer
```

### Step 2

Enable:

```text
☑ Allow unsigned extensions
```

If you don't see the **Developer** tab:

Go to:

```text
Safari → Settings → Advanced
```

and enable:

```text
☑ Show features for web developers
```

The exact location/name may vary slightly between macOS/Safari versions.

---

# ▶️ Register the extension

After placing the application inside `/Applications`, launch it once.

You can simply double-click:

```text
DSA Stopwatch.app
```

Alternatively, use Terminal:

```bash
open "/Applications/DSA Stopwatch.app"
```

This allows macOS to register the embedded Safari Web Extension.

Then open:

```text
Safari → Settings → Extensions
```

You should see:

```text
DSA Stopwatch Extension
```

Enable it.

---

# 🔧 If the extension does not appear

Sometimes macOS does not immediately register an unsigned extension.

Open Terminal and run:

```bash
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
-f "/Applications/DSA Stopwatch.app"
```

Then launch the application:

```bash
open "/Applications/DSA Stopwatch.app"
```

Now check whether macOS recognizes the Safari extension:

```bash
pluginkit -mAvvv -p com.apple.Safari.web-extension
```

You should see something similar to:

```text
com.dsastopwatch.DSA-Stopwatch.Extension(1.0)

    Path = /Applications/DSA Stopwatch.app/Contents/PlugIns/DSA Stopwatch Extension.appex

    SDK = com.apple.Safari.web-extension

    Parent Bundle = /Applications/DSA Stopwatch.app

    Display Name = DSA Stopwatch Extension
```

If you see:

```text
(1 plug-in)
```

then macOS has successfully registered the extension.

Restart Safari and check:

```text
Safari → Settings → Extensions
```

again.

---

# 🧩 Using the Extension

Once installed:

1. Open Safari.
2. Click the **Extensions** button in the Safari toolbar.
3. Select **DSA Stopwatch**.
4. The extension popup will appear.
5. Start your stopwatch when you begin solving a problem.
6. Stop it when you finish.

Your session information is stored locally by the extension.

---

# 🏗️ Building the Extension Yourself

You can also build the application yourself using GitHub Actions.

This is particularly useful if:

- You don't have enough disk space for Xcode.
- You don't want to install Xcode locally.
- You want to modify the extension.
- You want GitHub to handle the macOS build environment.

The repository contains a GitHub Actions workflow that uses a GitHub-hosted macOS machine with Xcode installed.

The basic process is:

```text
Modify extension
       ↓
git push
       ↓
GitHub Actions
       ↓
macOS runner
       ↓
Safari Web Extension packaging
       ↓
Xcode build
       ↓
Code signing
       ↓
.app
       ↓
GitHub Artifact
```

---

# 📁 Project Structure

The web extension itself lives inside the `extension/` directory.

A simplified structure looks like:

```text
.
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── popup.css
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-256.png
│       └── icon-512.png
│
└── .github/
    └── workflows/
        └── build-safari-extension.yml
```

---

# 📦 Manifest

The extension currently uses:

```json
{
    "manifest_version": 3,
    "name": "DSA Stopwatch",
    "version": "1.0",
    "description": "Track how long you spend solving each DSA problem, with a session log and CSV export.",
    "icons": {
        "16": "icons/icon-16.png",
        "32": "icons/icon-32.png",
        "48": "icons/icon-48.png",
        "96": "icons/icon-96.png",
        "128": "icons/icon-128.png",
        "256": "icons/icon-256.png",
        "512": "icons/icon-512.png"
    },
    "action": {
        "default_popup": "popup.html",
        "default_icon": {
            "16": "icons/icon-16.png",
            "32": "icons/icon-32.png",
            "48": "icons/icon-48.png",
            "128": "icons/icon-128.png"
        }
    },
    "background": {
        "service_worker": "background.js"
    },
    "permissions": [
        "storage",
        "alarms",
        "downloads"
    ]
}
```

The extension uses **Manifest V3** and a background service worker.

---

# ☁️ GitHub Actions Build

The repository contains:

```text
.github/workflows/build-safari-extension.yml
```

The workflow runs on a macOS GitHub-hosted runner.

It performs the following steps:

### 1. Checkout the repository

GitHub downloads the source code onto the macOS runner.

### 2. Install/use Apple's Safari extension tooling

The workflow uses Apple's Safari Web Extension tooling to generate an Xcode project from the web-extension source.

### 3. Build using Xcode

The generated project is compiled using:

```bash
xcodebuild
```

### 4. Ad-hoc signing

The application and embedded Safari extension are ad-hoc signed for development.

This does **not** require an Apple Developer certificate.

### 5. Verify the application

The workflow runs:

```bash
codesign --verify --deep --strict
```

to ensure that the application and embedded extension are valid.

### 6. Package the application

The resulting:

```text
DSA Stopwatch.app
```

is compressed into:

```text
DSAStopwatch.app.zip
```

### 7. Upload the build

The ZIP file is uploaded as a GitHub Actions artifact.

---

# 🧑‍💻 Development Workflow

After cloning the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

Modify files inside:

```text
extension/
```

For example:

```text
extension/popup.js
extension/background.js
extension/popup.html
```

Then commit and push:

```bash
git add .
git commit -m "Update stopwatch"
git push
```

The GitHub Actions workflow automatically starts because it watches:

```text
extension/**
```

After the workflow finishes:

```text
GitHub
  ↓
Actions
  ↓
Build Safari Extension
  ↓
Artifacts
  ↓
DSAStopwatch-macOS-app
```

Download the new build and replace the previous application in `/Applications`.

---

# 🔍 Verifying the Build

If you want to verify that the downloaded application contains the Safari extension, run:

```bash
codesign -dv --verbose=4 \
"/Applications/DSA Stopwatch.app"
```

Then verify the entire application:

```bash
codesign --verify --deep --strict --verbose=4 \
"/Applications/DSA Stopwatch.app"
```

You should see:

```text
valid on disk
satisfies its Designated Requirement
```

You can also check the embedded extension:

```bash
codesign -dv --verbose=4 \
"/Applications/DSA Stopwatch.app/Contents/PlugIns/DSA Stopwatch Extension.appex"
```

---

# 🧪 Development / Temporary Extensions

Safari also supports loading a Web Extension directly using:

```text
Safari → Settings → Developer → Add Temporary Extension...
```

This is useful when developing the raw extension files.

You can provide Safari with a directory containing:

```text
manifest.json
background.js
popup.html
popup.js
popup.css
icons/
```

For example:

```text
DSA-Stopwatch-Extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── popup.css
└── icons/
```

However, temporary extensions are intended for development/testing and are not the preferred installation method for the packaged application.

For normal use, install:

```text
DSA Stopwatch.app
```

instead.

---

# 🛣️ Roadmap

Planned improvements include:

- [ ] Improve session history
- [ ] Add problem name/URL tracking
- [ ] Automatically detect supported DSA websites
- [ ] Track per-problem solving time
- [ ] Add daily/weekly statistics
- [ ] Add difficulty tracking
- [ ] Add total DSA practice time
- [ ] Add charts and analytics
- [ ] Improve Safari compatibility
- [ ] Signed distribution build
- [ ] macOS/Safari release packaging

---

# 🔐 Privacy

DSA Stopwatch is designed to keep your session data locally.

The extension does not require a backend server for its basic stopwatch functionality.

The extension uses browser extension storage to maintain session information.

No account is required to use the basic extension.

---

# 🧠 Why GitHub Actions?

This project was originally built using GitHub Actions because Xcode could not be installed locally due to limited disk space.

Instead of installing the entire Xcode development environment locally:

```text
Local Mac
    │
    │ git push
    ↓
GitHub Actions
    │
    ↓
macOS runner
    │
    ├── Xcode
    ├── Safari tooling
    ├── Swift
    └── macOS SDK
    │
    ↓
DSA Stopwatch.app
    │
    ↓
Download
    │
    ↓
Local Mac
```

This makes it possible to develop the web-extension source locally while using GitHub's macOS infrastructure for the expensive build process.

---

# 🤝 Contributing

Contributions are welcome!

If you find a bug or have an idea for improving the extension:

1. Fork the repository.
2. Create a branch.

```bash
git checkout -b feature/my-feature
```

3. Make your changes.
4. Commit them.

```bash
git add .
git commit -m "Add my feature"
```

5. Push your branch.

```bash
git push origin feature/my-feature
```

6. Open a Pull Request.

---

# 🐛 Reporting Issues

When reporting an issue, please include:

- macOS version
- Safari version
- Whether "Allow unsigned extensions" is enabled
- Extension version
- What you were trying to do
- What happened
- Any relevant console errors

If the extension doesn't appear in Safari, run:

```bash
pluginkit -mAvvv -p com.apple.Safari.web-extension
```

and include the output in the issue.

---

# 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---

# ⭐ Support the Project

If you find DSA Stopwatch useful:

- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit improvements
- 📢 Share it with other students preparing for DSA interviews or competitive programming

---

## Made for people who spend way too much time solving DSA problems. ⏱️💻

**Track the time. Solve the problem. Get better.**
