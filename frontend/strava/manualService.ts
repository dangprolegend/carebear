//@ts-nocheck
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class ManualStravaAuthService {
  constructor() {
    this.clientId = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID;
    this.clientSecret = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET;
    
    this.redirectUri = Linking.createURL('auth/callback');
  }

  // Manual OAuth flow using WebBrowser
  async authenticate() {
    try {
      // Validate required config
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Missing Strava client credentials');
      }

      // Create the authorization URL
      const authUrl = this.buildAuthUrl();
      console.log('Opening auth URL:', authUrl);
      
      // Set up the linking listener before opening browser
      const linkingListener = this.setupLinkingListener();
      
      // Open the browser
      const result = await WebBrowser.openBrowserAsync(authUrl, {
        // Add these options for better compatibility
        showTitle: false,
        showInRecents: false,
      });
      console.log('Browser result:', result);
      
      // Wait for the redirect (this returns a promise that resolves when the redirect happens)
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          linkingListener.remove();
          reject(new Error('Authentication timeout'));
        }, 300000); // 5 minute timeout
        
        this.authPromiseResolve = (result) => {
          clearTimeout(timeout);
          linkingListener.remove();
          resolve(result);
        };
        
        this.authPromiseReject = (error) => {
          clearTimeout(timeout);
          linkingListener.remove();
          reject(error);
        };
      });
      
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
  
  // Build the Strava authorization URL
  buildAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      approval_prompt: 'force',
      scope: 'read,activity:read_all,profile:read_all'
    });
    
    const authUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;
    console.log('Full auth URL:', authUrl);
    return authUrl;
  }
  
  // Set up deep link listener
  setupLinkingListener() {
    const handleDeepLink = (event) => {
      console.log('Received deep link:', event.url);
      
      // Check if this is our auth callback
      if (event.url.includes('auth/callback') || event.url.includes('auth')) {
        this.handleAuthCallback(event.url);
      }
    };
    
    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return subscription;
  }
  
  // Handle the OAuth callback
  async handleAuthCallback(url) {
    try {
      console.log('Handling auth callback:', url);
      
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (e) {
        // If URL parsing fails, try manual parsing for custom schemes
        const urlParts = url.split('?');
        if (urlParts.length > 1) {
          const params = new URLSearchParams(urlParts[1]);
          const code = params.get('code');
          const error = params.get('error');
          
          if (error) {
            console.error('OAuth error:', error);
            this.authPromiseReject?.(new Error(`OAuth error: ${error}`));
            return;
          }
          
          if (code) {
            console.log('Authorization code received:', code.substring(0, 10) + '...');
            const tokenData = await this.exchangeCodeForToken(code);
            await this.storeTokens(tokenData);
            
            this.authPromiseResolve?.({
              success: true,
              athlete: tokenData.athlete,
              tokens: tokenData
            });
            return;
          }
        }
        throw new Error('Unable to parse callback URL');
      }
      
      const code = urlObj.searchParams.get('code');
      const error = urlObj.searchParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        this.authPromiseReject?.(new Error(`OAuth error: ${error}`));
        return;
      }
      
      if (!code) {
        console.error('No authorization code received');
        this.authPromiseReject?.(new Error('No authorization code received'));
        return;
      }
      
      console.log('Authorization code received:', code.substring(0, 10) + '...');
      
      // Exchange code for token
      const tokenData = await this.exchangeCodeForToken(code);
      await this.storeTokens(tokenData);
      
      this.authPromiseResolve?.({
        success: true,
        athlete: tokenData.athlete,
        tokens: tokenData
      });
      
    } catch (error) {
      console.error('Callback handling error:', error);
      this.authPromiseReject?.(error);
    }
  }
  
  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      console.log('Exchanging code for token...');
      
      const requestBody = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
      };
      
      console.log('Token exchange request:', { 
        ...requestBody, 
        client_secret: '***',
        code: code.substring(0, 10) + '...'
      });
      
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Token exchange response status:', response.status);
      console.log('Token exchange response:', { 
        ...data, 
        access_token: data.access_token ? '***' : 'missing',
        refresh_token: data.refresh_token ? '***' : 'missing'
      });
      
      if (response.ok && data.access_token) {
        return data;
      } else {
        console.error('Token exchange failed:', data);
        throw new Error(data.message || data.errors || 'Token exchange failed');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // Store tokens securely
  async storeTokens(tokenData) {
    try {
      await AsyncStorage.setItem('strava_access_token', tokenData.access_token);
      await AsyncStorage.setItem('strava_refresh_token', tokenData.refresh_token);
      await AsyncStorage.setItem('strava_expires_at', tokenData.expires_at.toString());
      await AsyncStorage.setItem('strava_athlete', JSON.stringify(tokenData.athlete));
      console.log('Tokens stored successfully');
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
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
          console.log('Token expired, attempting refresh...');
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
      if (!refreshToken) {
        console.log('No refresh token available');
        return null;
      }

      console.log('Refreshing token...');
      
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.access_token) {
        console.log('Token refreshed successfully');
        await this.storeTokens(data);
        return data.access_token;
      } else {
        console.error('Token refresh failed:', data);
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
      console.log('Tokens cleared');
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

export default ManualStravaAuthService;