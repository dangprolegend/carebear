//@ts-nocheck
import ManualStravaAuthService from "./manualService";

class StravaApiService {
  constructor() {
    this.authService = new ManualStravaAuthService();
    this.baseUrl = 'https://www.strava.com/api/v3';
  }

  // Make authenticated API request
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const accessToken = await this.authService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No valid access token available');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be invalid, clear it
        await this.authService.clearTokens();
        throw new Error('Authentication failed');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get athlete profile
  async getAthleteProfile() {
    return this.makeAuthenticatedRequest('/athlete');
  }

  // Get athlete activities
  async getActivities(page = 1, perPage = 30) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    return this.makeAuthenticatedRequest(`/athlete/activities?${params}`);
  }

  // Get specific activity
  async getActivity(activityId) {
    return this.makeAuthenticatedRequest(`/activities/${activityId}`);
  }

  // Get athlete stats
  async getAthleteStats(athleteId) {
    return this.makeAuthenticatedRequest(`/athletes/${athleteId}/stats`);
  }

  // Get activity zones (heart rate, power)
  async getActivityZones(activityId) {
    return this.makeAuthenticatedRequest(`/activities/${activityId}/zones`);
  }

  // Get activity streams (detailed data like GPS, heart rate over time)
  async getActivityStreams(activityId, types = ['time', 'latlng', 'distance', 'altitude', 'heartrate']) {
    const streamTypes = types.join(',');
    return this.makeAuthenticatedRequest(`/activities/${activityId}/streams/${streamTypes}`);
  }

  // Get activities within date range
  async getActivitiesInDateRange(after, before, page = 1, perPage = 30) {
    const params = new URLSearchParams({
      after: Math.floor(after.getTime() / 1000).toString(), // Convert to Unix timestamp
      before: Math.floor(before.getTime() / 1000).toString(),
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    return this.makeAuthenticatedRequest(`/athlete/activities?${params}`);
  }

  // Helper method to get recent activities with health-relevant data
  async getHealthData(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    try {
      const activities = await this.getActivitiesInDateRange(startDate, endDate);
      
      // Process activities to extract health-relevant data
      return activities.map(activity => ({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        date: activity.start_date,
        duration: activity.moving_time, // in seconds
        distance: activity.distance, // in meters
        calories: activity.kilojoules ? activity.kilojoules * 0.239006 : null, // Convert kJ to calories
        averageHeartRate: activity.average_heartrate,
        maxHeartRate: activity.max_heartrate,
        elevationGain: activity.total_elevation_gain,
        averageSpeed: activity.average_speed,
        maxSpeed: activity.max_speed,
        averagePower: activity.average_watts,
        maxPower: activity.max_watts,
      }));
    } catch (error) {
      console.error('Error fetching health data:', error);
      throw error;
    }
  }

  // Get weekly summary stats
  async getWeeklySummary() {
    try {
      const athlete = await this.getAthleteProfile();
      const stats = await this.getAthleteStats(athlete.id);
      
      return {
        thisWeek: {
          activities: stats.recent_run_totals.count + stats.recent_ride_totals.count + (stats.recent_walk_totals?.count || 0),
          distance: stats.recent_run_totals.distance + stats.recent_ride_totals.distance + (stats.recent_walk_totals?.distance || 0),
          movingTime: stats.recent_run_totals.moving_time + stats.recent_ride_totals.moving_time + (stats.recent_walk_totals?.moving_time || 0),
          elevationGain: stats.recent_run_totals.elevation_gain + stats.recent_ride_totals.elevation_gain + (stats.recent_walk_totals?.elevation_gain || 0),
        },
        allTime: {
          activities: stats.all_run_totals.count + stats.all_ride_totals.count + (stats.all_walk_totals?.count || 0),
          distance: stats.all_run_totals.distance + stats.all_ride_totals.distance + (stats.all_walk_totals?.distance || 0),
          movingTime: stats.all_run_totals.moving_time + stats.all_ride_totals.moving_time + (stats.all_walk_totals?.moving_time || 0),
          elevationGain: stats.all_run_totals.elevation_gain + stats.all_ride_totals.elevation_gain + (stats.all_walk_totals?.elevation_gain || 0),
        }
      };
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      throw error;
    }
  }
}

export default StravaApiService;