# App Icon Requirements for Deductly

## App Store Icon
- 1024×1024 pixels
- RGB color space
- Flattened with no transparency
- No rounded corners (App Store will add rounding)
- PNG or JPEG format

## iOS App Icons
You'll need the following sizes for your iOS app:

### iPhone
- 180×180 pixels (60pt @3x) - iPhone 6 Plus and above
- 120×120 pixels (60pt @2x) - iPhone 4s and above
- 167×167 pixels (83.5pt @2x) - iPad Pro
- 152×152 pixels (76pt @2x) - iPad, iPad mini
- 1024×1024 pixels - App Store

### Creating Your App Icon
1. Start with a high-resolution master file (at least 1024×1024 pixels)
2. Keep the design simple and recognizable
3. Use a single, bold graphic element with minimal details
4. Ensure it looks good at small sizes
5. Test on actual devices if possible

## Splash Screen
- Create a splash screen that's 2732×2732 pixels to cover all device sizes
- Keep it simple with your logo centered
- Use a background color that matches your app's theme
- Save as PNG format

## Tools for Creating App Icons
- Sketch
- Figma
- Adobe Photoshop
- [Makeappicon.com](https://makeappicon.com/) - Automatically generates all required sizes

## Placing Your Icons
Once created, place your app icons in:
- `/Users/briana/CascadeProjects/deductly-app/assets/icon.png` (1024×1024px)
- `/Users/briana/CascadeProjects/deductly-app/assets/splash.png` (2732×2732px)
- `/Users/briana/CascadeProjects/deductly-app/assets/adaptive-icon.png` (For Android)
- `/Users/briana/CascadeProjects/deductly-app/assets/favicon.png` (For web)

Expo will automatically generate all the required sizes for different devices based on these source files.
