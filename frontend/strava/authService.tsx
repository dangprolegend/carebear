//@ts-nocheck
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete the auth session properly for web
WebBrowser.maybeCompleteAuthSession();

class StravaAuthService {
  constructor() {
    this.clientId = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID;
    this.clientSecret = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET;
    this.redirectUri = AuthSession.makeRedirectUri({
      scheme: 'myapp',
      useProxy: true, // Expo's proxy for development
    });
    
    this.discoveryDocument = {
      authorizationEndpoint: 'https://www.strava.com/oauth/authorize',
      tokenEndpoint: 'https://www.strava.com/oauth/token',
    };
  }

  // Create auth request
  createAuthRequest() {
    return new AuthSession.AuthRequest({
      clientId: this.clientId,
      scopes: ['read', 'activity:read_all', 'profile:read_all'],
      redirectUri: this.redirectUri,
      responseType: AuthSession.ResponseType.Code,
      additionalParameters: {
        approval_prompt: 'force', // Always show consent screen
      },
    });
  }

  // Exchange auth code for tokens
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store tokens securely
        await this.storeTokens(data);
        return data;
      } else {
        throw new Error(data.message || 'Token exchange failed');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // Store tokens in AsyncStorage
  async storeTokens(tokenData) {
    try {
      await AsyncStorage.setItem('strava_access_token', tokenData.access_token);
      await AsyncStorage.setItem('strava_refresh_token', tokenData.refresh_token);
      await AsyncStorage.setItem('strava_expires_at', tokenData.expires_at.toString());
      await AsyncStorage.setItem('strava_athlete', JSON.stringify(tokenData.athlete));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  // Get stored access token
  async getAccessToken() {
    try {
      const token = await AsyncStorage.getItem('strava_access_token');
      const expiresAt = await AsyncStorage.getItem('strava_expires_at');
      
      if (token && expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        if (parseInt(expiresAt) > now) {
          return token;
        } else {
          // Token expired, try to refresh
          return await this.refreshToken();
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Refresh expired token
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('strava_refresh_token');
      if (!refreshToken) return null;

      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await this.storeTokens(data);
        return data.access_token;
      } else {
        // Refresh failed, user needs to re-authenticate
        await this.clearTokens();
        return null;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  // Clear stored tokens
  async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        'strava_access_token',
        'strava_refresh_token',
        'strava_expires_at',
        'strava_athlete'
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getAccessToken();
    return token !== null;
  }

  // Get athlete profile
  async getAthleteProfile() {
    try {
      const stored = await AsyncStorage.getItem('strava_athlete');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting athlete profile:', error);
      return null;
    }
  }
}

export default StravaAuthService;