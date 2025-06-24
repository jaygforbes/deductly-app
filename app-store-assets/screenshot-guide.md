# Capturing Screenshots with Xcode for Deductly App Store Submission

This guide will walk you through capturing high-quality screenshots of your Deductly app using Xcode's simulator for App Store submission.

## Required Screenshot Sizes

Apple requires screenshots for the following device sizes:

1. **iPhone 6.5" Display** (1284 × 2778 pixels portrait)
   - Use iPhone 14 Pro Max or iPhone 15 Pro Max simulator

2. **iPhone 5.5" Display** (1242 × 2208 pixels portrait)
   - Use iPhone 8 Plus simulator

3. **iPad Pro 12.9"** (2048 × 2732 pixels portrait)
   - Use iPad Pro (12.9-inch) simulator

## Step-by-Step Screenshot Capture Process

### 1. Launch Xcode and Open Your Project

```bash
open -a Xcode /Users/briana/CascadeProjects/deductly-app
```

If you're using Expo, you may need to build the app for the simulator first:

```bash
cd /Users/briana/CascadeProjects/deductly-app
npx expo start --ios
```

### 2. Set Up the Simulator

1. In Xcode, go to **Xcode > Open Developer Tool > Simulator**
2. In the simulator, select **File > New Simulator** if you need to create simulators for specific devices
3. Choose the device type from **Hardware > Device** menu

### 3. Prepare Your App for Screenshots

Before taking screenshots, make sure to:

1. Log in with the demo reviewer account
2. Navigate to screens that showcase key features
3. Populate with realistic data
4. Ensure the UI is clean and professional

### 4. Capture Screenshots

#### Method 1: Using Simulator's Built-in Screenshot Feature

1. Navigate to the screen you want to capture
2. Press **Command (⌘) + S** to save a screenshot
3. The screenshot will be saved to your Desktop

#### Method 2: Using Xcode's Screenshot Tool

1. With the simulator running, go to **Debug > View Debugging > Capture Screenshot**
2. The screenshot will be added to your Xcode project

#### Method 3: Using Terminal Commands

You can also capture screenshots using the `xcrun` command:

```bash
xcrun simctl io booted screenshot ~/Desktop/deductly_screenshot_1.png
```

### 5. Recommended Screenshots to Capture

For Deductly, capture these key screens:

1. **Home/Dashboard** - Show the financial overview
2. **Receipt Scanning** - Demonstrate the scanning feature
3. **Mileage Tracking** - Show the map interface
4. **Expense Categories** - Display organization features
5. **Reports/Analytics** - Show tax savings or reports

### 6. Adding Marketing Overlays (Optional)

After capturing raw screenshots, you may want to:

1. Add device frames using Apple's [App Store Connect Marketing Tools](https://tools.applemac.com/)
2. Add text overlays highlighting key features
3. Ensure consistent branding across all screenshots

### 7. Organizing Your Screenshots

Save your screenshots in the following directory structure:

```
/Users/briana/CascadeProjects/deductly-app/app-store-assets/screenshots/
├── 6.5-inch/
│   ├── screenshot1.png
│   ├── screenshot2.png
│   └── ...
├── 5.5-inch/
│   ├── screenshot1.png
│   └── ...
└── 12.9-inch-ipad/
    ├── screenshot1.png
    └── ...
```

## Tips for Great App Store Screenshots

1. **Show your app in action** - Capture dynamic, engaging moments
2. **Highlight key features** - Each screenshot should showcase a different feature
3. **Use high-contrast scenes** - Make sure text is readable
4. **Be consistent** - Maintain visual consistency across all screenshots
5. **Consider localization** - If your app supports multiple languages, capture screenshots for each

## Next Steps After Capturing Screenshots

Once you have all your screenshots:

1. Resize them to the exact required dimensions if needed
2. Add marketing overlays if desired
3. Upload them to App Store Connect when setting up your app listing

Need help with any specific part of this process? Let me know!
