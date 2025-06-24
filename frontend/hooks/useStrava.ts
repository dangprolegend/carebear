//@ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import StravaAuthService from '~/strava/authService';
import StravaApiService from '~/strava/apiService';

export const useStrava = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [athlete, setAthlete] = useState(null);
  const [authService] = useState(() => new StravaAuthService());
  const [apiService] = useState(() => new StravaApiService());

  // Initialize auth state
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const athleteProfile = await authService.getAthleteProfile();
        setAthlete(athleteProfile);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication flow
  const authenticate = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const request = authService.createAuthRequest();
      const result = await AuthSession.promptAsync(request, authService.discoveryDocument);
      
      if (result.type === 'success' && result.params.code) {
        const tokenData = await authService.exchangeCodeForToken(result.params.code);
        setIsAuthenticated(true);
        setAthlete(tokenData.athlete);
        return { success: true, athlete: tokenData.athlete };
      } else if (result.type === 'cancel') {
        return { success: false, error: 'Authentication cancelled' };
      } else {
        return { success: false, error: result.params?.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await authService.clearTokens();
      setIsAuthenticated(false);
      setAthlete(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [authService]);

  // Get activities
  const getActivities = useCallback(async (page = 1, perPage = 30) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return apiService.getActivities(page, perPage);
  }, [isAuthenticated, apiService]);

  // Get health data
  const getHealthData = useCallback(async (days = 7) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return apiService.getHealthData(days);
  }, [isAuthenticated, apiService]);

  // Get weekly summary
  const getWeeklySummary = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return apiService.getWeeklySummary();
  }, [isAuthenticated, apiService]);

  // Get specific activity
  const getActivity = useCallback(async (activityId) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return apiService.getActivity(activityId);
  }, [isAuthenticated, apiService]);

  return {
    // Auth state
    isAuthenticated,
    isLoading,
    athlete,
    
    // Auth methods
    authenticate,
    signOut,
    
    // API methods
    getActivities,
    getHealthData,
    getWeeklySummary,
    getActivity,
    
    // Refresh auth status
    refreshAuthStatus: checkAuthStatus,
  };
};