import { sha256 } from 'react-native-sha256';
import { AccessToken, AuthenticationToken, LoginManager } from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';

function generateNonce(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      nonce += characters[randomIndex];
    }
    return nonce;
  }

 export async function onFacebookButtonPressIOS() {
    // Create a nonce and the corresponding
    // sha256 hash of the nonce
    const nonce = generateNonce();
    const nonceSha256 = await sha256(nonce);
    // Attempt login with permissions and limited login
    const result = await LoginManager.logInWithPermissions(
      ['public_profile', 'email'],
      'limited',
      nonceSha256,
    );

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AuthenticationToken
    const data = await AuthenticationToken.getAuthenticationTokenIOS();

    if (!data) {
      throw 'Something went wrong obtaining authentication token';
    }

    // Create a Firebase credential with the AuthenticationToken
    // and the nonce (Firebase will validates the hash against the nonce)
    const facebookCredential = auth.FacebookAuthProvider.credential(data.authenticationToken, nonce);

    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
  }

export async function onFacebookButtonPressAndroid() {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
}