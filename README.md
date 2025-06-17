Welcome to Carebear App Development Build

*How to build*
1. Instal cli 
```
npm install -g eas-cli
```
2. Login using carebear.vtmp@gmail.com (password like email password)
```
eas login
```
3. start build
```
eas build --profile development --platform android
```
4. Check build status and error (if have): https://expo.dev/accounts/vtmp-group-4/projects/care/builds

   
*How to run*
1. After run, you will receive an **.apk** package in terminal -> click on it and download
2. Open Android Studio, run your mobile app in **device manager**
<img width="794" alt="Screenshot 2025-06-17 at 08 15 29" src="https://github.com/user-attachments/assets/1ed8c175-8db9-471e-95eb-18b876d363ed" />

- mine is Pixel 6 Pro, I press the play button

3. Drag the **.apk** package into simulator 
4. Wait for it to downloaded into simulator
5. run this command **without** pressing s (expogo) or a (android)
```
npx expo start -c 
```
- Note: DO NOT PRESS ANY BUTTON AT THIS TIME

6. You will see the update in android simulator, from now on, you won't need to build again unless you use new native library. You only need to run **npx expo start -c** and open the simulator and you can start code

