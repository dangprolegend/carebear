import axios from 'axios';

// Base URL for API endpoints
const API_BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0,
};

// Helper function to log test results
function logTest(testName: string, success: boolean, data?: any, error?: any): void {
  results.total++;
  if (success) {
    results.passed++;
    console.log(`${colors.green}✓ PASS:${colors.reset} ${testName}`);
    if (data) {
      console.log(`  ${colors.cyan}Response:${colors.reset}`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
    }
  } else {
    results.failed++;
    console.log(`${colors.red}✗ FAIL:${colors.reset} ${testName}`);
    if (error) {
      console.log(`  ${colors.red}Error:${colors.reset}`, error.message || error);
    }
  }
  console.log(); // Empty line for readability
}

// Helper function to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store created entities for later tests
let testUser: any = null;
let testGroup: any = null;
let testTask: any = null;
let testMember: any = null;
let testNotification: any = null;

// Run tests sequentially
async function runTests() {
  console.log(`${colors.magenta}===========================================${colors.reset}`);
  console.log(`${colors.magenta}   CAREBEAR API TEST SUITE - TYPESCRIPT    ${colors.reset}`);
  console.log(`${colors.magenta}===========================================${colors.reset}`);
  console.log();

  try {
    // 1. Test health check endpoint
    await testHealthCheck();

    // 2. User endpoints tests
    await testCreateUser();
    await testGetUser();
    await testGetAllUsers();
    await testUserLogin();
    await testUpdateUser();

    // 3. Group endpoints tests
    await testCreateGroup();
    await testGetAllGroups();
    await testGetGroup();
    await testGetUserGroups();
    
    // 4. Member endpoints tests
    await testAddMember();
    await testGetGroupMembers();
    await testGetUserMemberships();
    await testUpdateMember();
    
    // 5. Task endpoints tests
    await testCreateTask();
    await testGetGroupTasks();
    await testGetUserTasks();
    await testGetTask();
    await testUpdateTaskStatus();
    await testUpdateTask();
    
    // 6. Notification endpoints tests
    await testCreateNotification();
    await testGetUserNotifications();
    
    // 7. Dashboard endpoints tests
    await testAddMetric();
    await testGetUserMetrics();
    await testGetGroupMetrics();
    
    // 8. Cleanup tests
    await testDeleteNotification();
    await testDeleteTask();
    await testRemoveMember();
    await testDeleteGroup();
    await testDeleteUser();

  } catch (err: any) {
    console.error(`${colors.red}Test execution error:${colors.reset}`, err.message);
  } finally {
    // Print test summary
    console.log(`${colors.magenta}===========================================${colors.reset}`);
    console.log(`${colors.magenta}               TEST SUMMARY               ${colors.reset}`);
    console.log(`${colors.magenta}===========================================${colors.reset}`);
    console.log(`Total tests: ${results.total}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    console.log(`${colors.magenta}===========================================${colors.reset}`);
  }
}

// Individual test functions
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:5000/');
    logTest('Health Check', response.status === 200, response.data);
  } catch (error: any) {
    logTest('Health Check', false, null, error);
  }
}

// User Endpoints Tests
async function testCreateUser() {
  try {
    const userData = {
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
    };
    
    const response = await axios.post(`${API_BASE_URL}/users/signup`, userData);
    testUser = response.data;
    
    logTest('Create User', 
      response.status === 201 && 
      testUser.email === userData.email && 
      testUser.name === userData.name &&
      testUser.username !== undefined, 
      response.data);
  } catch (error: any) {
    logTest('Create User', false, null, error);
  }
}

async function testGetUser() {
  if (!testUser || !testUser._id) {
    logTest('Get User', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${testUser._id}`);
    logTest('Get User by ID', 
      response.status === 200 && 
      response.data._id === testUser._id, 
      response.data);
      
    // Also test getting user by username
    const usernameResponse = await axios.get(`${API_BASE_URL}/users/${testUser.username}`);
    logTest('Get User by Username', 
      usernameResponse.status === 200 && 
      usernameResponse.data._id === testUser._id, 
      usernameResponse.data);
  } catch (error: any) {
    logTest('Get User', false, null, error);
  }
}

async function testGetAllUsers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    logTest('Get All Users', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data.length);
  } catch (error: any) {
    logTest('Get All Users', false, null, error);
  }
}

async function testUserLogin() {
  if (!testUser || !testUser.email) {
    logTest('User Login', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, { email: testUser.email });
    logTest('User Login', 
      response.status === 200 && 
      response.data._id === testUser._id, 
      response.data);
  } catch (error: any) {
    logTest('User Login', false, null, error);
  }
}

async function testUpdateUser() {
  if (!testUser || !testUser._id) {
    logTest('Update User', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const updatedData = {
      name: 'Updated Test User'
    };
    
    const response = await axios.put(`${API_BASE_URL}/users/${testUser._id}`, updatedData);
    testUser = response.data; // Update our reference
    
    logTest('Update User', 
      response.status === 200 && 
      response.data.name === updatedData.name, 
      response.data);
  } catch (error: any) {
    logTest('Update User', false, null, error);
  }
}

// Group Endpoints Tests
async function testCreateGroup() {
  if (!testUser || !testUser._id) {
    logTest('Create Group', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const groupData = {
      name: `Test Group ${Date.now()}`,
      user: testUser._id
    };
    
    console.log('Sending group creation request with data:', JSON.stringify(groupData));
    
    const response = await axios.post(`${API_BASE_URL}/groups`, groupData);
    testGroup = response.data;
    
    logTest('Create Group', 
      response.status === 201 && 
      testGroup.name === groupData.name, 
      response.data);
  } catch (error: any) {
    console.error('Create Group Error Details:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request made but no response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
    }
    logTest('Create Group', false, null, error);
  }
}

async function testGetAllGroups() {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups`);
    logTest('Get All Groups', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data.length);
  } catch (error: any) {
    logTest('Get All Groups', false, null, error);
  }
}

async function testGetGroup() {
  if (!testGroup || !testGroup._id) {
    logTest('Get Group', false, null, new Error('No test group created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${testGroup._id}`);
    logTest('Get Group', 
      response.status === 200 && 
      response.data._id === testGroup._id, 
      response.data);
  } catch (error: any) {
    logTest('Get Group', false, null, error);
  }
}

async function testGetUserGroups() {
  if (!testUser || !testUser._id) {
    logTest('Get User Groups', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/user/${testUser._id}`);
    logTest('Get User Groups', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data);
  } catch (error: any) {
    logTest('Get User Groups', false, null, error);
  }
}

// Member Endpoints Tests
async function testAddMember() {
  if (!testUser || !testUser._id || !testGroup || !testGroup._id) {
    logTest('Add Member', false, null, new Error('Test user or group not created'));
    return;
  }
  
  try {
    // First, get existing members to check if test user is already a member
    const membersResponse = await axios.get(`${API_BASE_URL}/members/group/${testGroup._id}`);
    const existingMembers = membersResponse.data;
    
    // Check if our test user is already a member (which happens by default when creating a group)
    const userAlreadyMember = existingMembers.some((member: any) => 
      member.user._id === testUser._id || member.user === testUser._id
    );
    
    if (userAlreadyMember) {
      // If user is already a member, find their existing membership and use it
      const existingMembership = existingMembers.find((member: any) => 
        member.user._id === testUser._id || member.user === testUser._id
      );
      
      testMember = existingMembership;
      console.log('User is already a member of the group, using existing membership:', testMember);
      
      logTest('Add Member (already exists)', 
        true, 
        testMember);
      return;
    }
    
    // If user is not already a member, create a new membership
    const memberData = {
      user: testUser._id,
      group: testGroup._id,
      role: 'caregiver'
    };
    
    const response = await axios.post(`${API_BASE_URL}/members`, memberData);
    testMember = response.data;
    
    logTest('Add Member', 
      response.status === 201 && 
      testMember.user === memberData.user && 
      testMember.group === memberData.group && 
      testMember.role === memberData.role, 
      response.data);
  } catch (error: any) {
    logTest('Add Member', false, null, error);
  }
}

async function testGetGroupMembers() {
  if (!testGroup || !testGroup._id) {
    logTest('Get Group Members', false, null, new Error('No test group created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/members/group/${testGroup._id}`);
    logTest('Get Group Members', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data);
  } catch (error: any) {
    logTest('Get Group Members', false, null, error);
  }
}

async function testGetUserMemberships() {
  if (!testUser || !testUser._id) {
    logTest('Get User Memberships', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/members/user/${testUser._id}`);
    logTest('Get User Memberships', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data);
  } catch (error: any) {
    logTest('Get User Memberships', false, null, error);
  }
}

async function testUpdateMember() {
  if (!testMember || !testMember._id) {
    logTest('Update Member', false, null, new Error('No test member created'));
    return;
  }
  
  try {
    // Choose a different role than the current one
    const currentRole = testMember.role;
    const newRole = currentRole === 'admin' ? 'carereceiver' : (currentRole === 'carereceiver' ? 'caregiver' : 'carereceiver');
    
    const updateData = {
      role: newRole
    };
    
    console.log(`Updating member from role '${currentRole}' to '${newRole}'`);
    
    const response = await axios.put(`${API_BASE_URL}/members/${testMember._id}`, updateData);
    testMember = response.data; // Update our reference
    
    logTest('Update Member', 
      response.status === 200 && 
      response.data.role === updateData.role, 
      response.data);
  } catch (error: any) {
    logTest('Update Member', false, null, error);
  }
}

// Task Endpoints Tests
async function testCreateTask() {
  if (!testUser || !testUser._id || !testGroup || !testGroup._id) {
    logTest('Create Task', false, null, new Error('Test user or group not created'));
    return;
  }
  
  try {
    const taskData = {
      user: testUser._id,
      group: testGroup._id,
      assignedBy: testUser._id,
      assignedTo: testUser._id,
      description: 'Test task description',
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
    testTask = response.data;
    
    logTest('Create Task', 
      response.status === 201 && 
      testTask.description === taskData.description, 
      response.data);
  } catch (error: any) {
    logTest('Create Task', false, null, error);
  }
}

async function testGetGroupTasks() {
  if (!testGroup || !testGroup._id) {
    logTest('Get Group Tasks', false, null, new Error('No test group created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/group/${testGroup._id}`);
    logTest('Get Group Tasks', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data);
  } catch (error: any) {
    logTest('Get Group Tasks', false, null, error);
  }
}

async function testGetUserTasks() {
  if (!testUser || !testUser._id) {
    logTest('Get User Tasks', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/user/${testUser._id}`);
    logTest('Get User Tasks', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data);
  } catch (error: any) {
    logTest('Get User Tasks', false, null, error);
  }
}

async function testGetTask() {
  if (!testTask || !testTask._id) {
    logTest('Get Task', false, null, new Error('No test task created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/${testTask._id}`);
    logTest('Get Task', 
      response.status === 200 && 
      response.data._id === testTask._id, 
      response.data);
  } catch (error: any) {
    logTest('Get Task', false, null, error);
  }
}

async function testUpdateTaskStatus() {
  if (!testTask || !testTask._id) {
    logTest('Update Task Status', false, null, new Error('No test task created'));
    return;
  }
  
  try {
    const statusData = {
      status: 'in-progress'
    };
    
    const response = await axios.put(`${API_BASE_URL}/tasks/${testTask._id}/status`, statusData);
    testTask = response.data; // Update our reference
    
    logTest('Update Task Status', 
      response.status === 200 && 
      response.data.status === statusData.status, 
      response.data);
  } catch (error: any) {
    logTest('Update Task Status', false, null, error);
  }
}

async function testUpdateTask() {
  if (!testTask || !testTask._id) {
    logTest('Update Task', false, null, new Error('No test task created'));
    return;
  }
  
  try {
    const updateData = {
      description: 'Updated task description',
      priority: 'high'
    };
    
    const response = await axios.put(`${API_BASE_URL}/tasks/${testTask._id}`, updateData);
    testTask = response.data; // Update our reference
    
    logTest('Update Task', 
      response.status === 200 && 
      response.data.description === updateData.description &&
      response.data.priority === updateData.priority, 
      response.data);
  } catch (error: any) {
    logTest('Update Task', false, null, error);
  }
}

// Notification Endpoints Tests
async function testCreateNotification() {
  if (!testUser || !testUser._id || !testTask || !testTask._id) {
    logTest('Create Notification', false, null, new Error('Test user or task not created'));
    return;
  }
  
  try {
    const notificationData = {
      user: testUser._id,
      task: testTask._id
    };
    
    const response = await axios.post(`${API_BASE_URL}/notifications`, notificationData);
    testNotification = response.data;
    
    logTest('Create Notification', 
      response.status === 201 && 
      testNotification.user === notificationData.user &&
      testNotification.task === notificationData.task, 
      response.data);
  } catch (error: any) {
    logTest('Create Notification', false, null, error);
  }
}

async function testGetUserNotifications() {
  if (!testUser || !testUser._id) {
    logTest('Get User Notifications', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/user/${testUser._id}`);
    logTest('Get User Notifications', 
      response.status === 200 && 
      Array.isArray(response.data), 
      response.data);
  } catch (error: any) {
    logTest('Get User Notifications', false, null, error);
  }
}

// Dashboard Endpoints Tests
async function testAddMetric() {
  if (!testUser || !testUser._id || !testTask || !testTask._id) {
    logTest('Add Metric', false, null, new Error('Test user or task not created'));
    return;
  }
  
  try {
    const metricData = {
      user: testUser._id,
      task: testTask._id,
      metric_value: 85
    };
    
    const response = await axios.post(`${API_BASE_URL}/dashboard/metric`, metricData);
    
    logTest('Add Metric', 
      response.status === 201 && 
      response.data.user === metricData.user &&
      response.data.task === metricData.task &&
      response.data.metric_value === metricData.metric_value, 
      response.data);
  } catch (error: any) {
    logTest('Add Metric', false, null, error);
  }
}

async function testGetUserMetrics() {
  if (!testUser || !testUser._id) {
    logTest('Get User Metrics', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/user/${testUser._id}`);
    logTest('Get User Metrics', 
      response.status === 200, 
      response.data);
  } catch (error: any) {
    logTest('Get User Metrics', false, null, error);
  }
}

async function testGetGroupMetrics() {
  if (!testGroup || !testGroup._id) {
    logTest('Get Group Metrics', false, null, new Error('No test group created'));
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/group/${testGroup._id}`);
    logTest('Get Group Metrics', 
      response.status === 200, 
      response.data);
  } catch (error: any) {
    logTest('Get Group Metrics', false, null, error);
  }
}

// Cleanup Tests
async function testDeleteNotification() {
  if (!testNotification || !testNotification._id) {
    logTest('Delete Notification', false, null, new Error('No test notification created'));
    return;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/notifications/${testNotification._id}`);
    logTest('Delete Notification', 
      response.status === 200, 
      response.data);
  } catch (error: any) {
    logTest('Delete Notification', false, null, error);
  }
}

async function testDeleteTask() {
  if (!testTask || !testTask._id) {
    logTest('Delete Task', false, null, new Error('No test task created'));
    return;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${testTask._id}`);
    logTest('Delete Task', 
      response.status === 200, 
      response.data);
  } catch (error: any) {
    logTest('Delete Task', false, null, error);
  }
}

async function testRemoveMember() {
  if (!testMember || !testMember._id) {
    logTest('Remove Member', false, null, new Error('No test member created'));
    return;
  }
  
  // The test member may be the admin of the group, created during group creation
  // If so, we should create a new member to remove instead of the admin
  try {
    // Check if this is the admin member, created during group creation
    if (testMember.role === 'admin') {
      console.log('Cannot remove admin member created during group creation. Creating a new member to remove instead.');
      
      // Create a temporary user for this test
      const userData = {
        email: `test_remove_member_${Date.now()}@example.com`,
        name: 'Temporary User for Member Removal Test',
      };
      
      const userResponse = await axios.post(`${API_BASE_URL}/users/signup`, userData);
      const tempUser = userResponse.data;
      
      // Add this user as a member with a non-admin role
      const memberData = {
        user: tempUser._id,
        group: testGroup._id,
        role: 'caregiver'
      };
      
      const memberResponse = await axios.post(`${API_BASE_URL}/members`, memberData);
      const tempMember = memberResponse.data;
      
      // Now delete this temporary member
      const removeResponse = await axios.delete(`${API_BASE_URL}/members/${tempMember._id}`);
      
      logTest('Remove Member (temp)', 
        removeResponse.status === 200, 
        removeResponse.data);
      
      // Clean up the temporary user
      await axios.delete(`${API_BASE_URL}/users/${tempUser._id}`);
    } else {
      // If this is not the admin member, we can safely remove it
      const response = await axios.delete(`${API_BASE_URL}/members/${testMember._id}`);
      logTest('Remove Member', 
        response.status === 200, 
        response.data);
    }
  } catch (error: any) {
    logTest('Remove Member', false, null, error);
  }
}

async function testDeleteGroup() {
  if (!testGroup || !testGroup._id) {
    logTest('Delete Group', false, null, new Error('No test group created'));
    return;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/groups/${testGroup._id}`);
    logTest('Delete Group', 
      response.status === 200, 
      response.data);
  } catch (error: any) {
    logTest('Delete Group', false, null, error);
  }
}

async function testDeleteUser() {
  if (!testUser || !testUser._id) {
    logTest('Delete User', false, null, new Error('No test user created'));
    return;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${testUser._id}`);
    logTest('Delete User', 
      response.status === 200, 
      response.data);
  } catch (error: any) {
    logTest('Delete User', false, null, error);
  }
}

// Run all tests
runTests();