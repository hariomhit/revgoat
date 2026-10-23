# 📱 RevGOAT - React Native Mobile App

Yeh aapka **100% Pure React Native App** hai jo web se bilkul alag hai aur direct mobile phone (Android / iOS) par install ho sakta hai.

---

## 🚀 Phone Par Kaise Chalayein (Without Android Studio in 10 Seconds):

1. Apne phone (Android ya iPhone) par Google Play Store / Apple App Store se free **"Expo Go"** app install karein.
2. Apne computer terminal mein `mobile` folder ke andar jayein:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Terminal screen par ek **QR Code** aayega.
4. Apne phone ke **Expo Go** app se wo QR code scan karein:
   - **RevGOAT App turant aapke phone par as a native mobile app khul jayegi!**

---

## 📦 Direct Standalone `.apk` File Kaise Generate Karein (Cloud Build):

Aapko apne computer par koi Android Studio ya heavy software nahi chahiye. Expo cloud direct aapko `.apk` download link deta hai:

```bash
cd mobile
npx eas-cli build -p android --profile preview
```
Yeh command aapko direct ek **Download Link** degi jahan se aap **`.apk`** file download karke kisi ko bhi WhatsApp ya Drive se bhej sakte hain aur phone me 1-click install kar sakte hain!
