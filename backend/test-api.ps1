# CareBear API Test Script (PowerShell)
# This script tests the various endpoints of the CareBear API

# Configuration
$apiBaseUrl = "http://localhost:5000/api"
$testData = @{}

Write-Host "========================================="
Write-Host "      CAREBEAR API TEST SUITE (PS1)      "
Write-Host "========================================="
Write-Host

# Test health check endpoint
try {
    Write-Host "Testing Health Check Endpoint..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
    Write-Host "✅ Success: API is running" -ForegroundColor Green
    Write-Host "Response: $response" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: Health check failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test user creation
try {
    Write-Host "Testing User Creation..." -ForegroundColor Cyan
    $randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
    $userData = @{
        email = "testuser$randomSuffix@example.com"
        name = "Test User $randomSuffix"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBaseUrl/users/signup" -Method Post -Body $userData -ContentType "application/json"
    $testData.user = $response
    
    Write-Host "✅ Success: Created user with ID: $($response._id)" -ForegroundColor Green
    Write-Host "Username: $($response.username)" -ForegroundColor Gray
    Write-Host "Email: $($response.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: User creation failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get User by ID
try {
    if ($testData.user._id) {
        Write-Host "Testing Get User by ID..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/users/$($testData.user._id)" -Method Get
        
        Write-Host "✅ Success: Retrieved user with ID: $($response._id)" -ForegroundColor Green
        Write-Host "Username: $($response.username)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Skipping: No test user available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Get user failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get All Users
try {
    Write-Host "Testing Get All Users..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "$apiBaseUrl/users" -Method Get
    
    Write-Host "✅ Success: Retrieved $(($response | Measure-Object).Count) users" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: Get all users failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Create Group
try {
    if ($testData.user._id) {
        Write-Host "Testing Group Creation..." -ForegroundColor Cyan
        $groupData = @{
            name = "Test Group $randomSuffix"
            user = $testData.user._id
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/groups" -Method Post -Body $groupData -ContentType "application/json"
        $testData.group = $response
        
        Write-Host "✅ Success: Created group with ID: $($response._id)" -ForegroundColor Green
        Write-Host "Group name: $($response.name)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Skipping: No test user available for group creation" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Group creation failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get Group
try {
    if ($testData.group._id) {
        Write-Host "Testing Get Group..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/groups/$($testData.group._id)" -Method Get
        
        Write-Host "✅ Success: Retrieved group with ID: $($response._id)" -ForegroundColor Green
        Write-Host "Group name: $($response.name)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Skipping: No test group available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Get group failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get User Groups
try {
    if ($testData.user._id) {
        Write-Host "Testing Get User Groups..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/groups/user/$($testData.user._id)" -Method Get
        
        Write-Host "✅ Success: Retrieved $(($response | Measure-Object).Count) groups for user" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping: No test user available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Get user groups failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Add Member
try {
    if ($testData.user._id -and $testData.group._id) {
        Write-Host "Testing Add Member..." -ForegroundColor Cyan
        $memberData = @{
            user = $testData.user._id
            group = $testData.group._id
            role = "caregiver"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/members" -Method Post -Body $memberData -ContentType "application/json"
        $testData.member = $response
        
        Write-Host "✅ Success: Added member with ID: $($response._id)" -ForegroundColor Green
        Write-Host "Role: $($response.role)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Skipping: No test user or group available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Add member failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get Group Members
try {
    if ($testData.group._id) {
        Write-Host "Testing Get Group Members..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/members/group/$($testData.group._id)" -Method Get
        
        Write-Host "✅ Success: Retrieved $(($response | Measure-Object).Count) members for group" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping: No test group available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Get group members failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Create Task
try {
    if ($testData.user._id -and $testData.group._id) {
        Write-Host "Testing Task Creation..." -ForegroundColor Cyan
        $taskData = @{
            user = $testData.user._id
            group = $testData.group._id
            assignedBy = $testData.user._id
            assignedTo = $testData.user._id
            description = "Test task $randomSuffix"
            priority = "medium"
            deadline = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/tasks" -Method Post -Body $taskData -ContentType "application/json"
        $testData.task = $response
        
        Write-Host "✅ Success: Created task with ID: $($response._id)" -ForegroundColor Green
        Write-Host "Task description: $($response.description)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Skipping: No test user or group available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Task creation failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get Group Tasks
try {
    if ($testData.group._id) {
        Write-Host "Testing Get Group Tasks..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/tasks/group/$($testData.group._id)" -Method Get
        
        Write-Host "✅ Success: Retrieved $(($response | Measure-Object).Count) tasks for group" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping: No test group available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Get group tasks failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Update Task Status
try {
    if ($testData.task._id) {
        Write-Host "Testing Update Task Status..." -ForegroundColor Cyan
        $statusData = @{
            status = "in-progress"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/tasks/$($testData.task._id)/status" -Method Put -Body $statusData -ContentType "application/json"
        
        Write-Host "✅ Success: Updated task status to: $($response.status)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping: No test task available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Update task status failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Create Notification
try {
    if ($testData.user._id -and $testData.task._id) {
        Write-Host "Testing Create Notification..." -ForegroundColor Cyan
        $notificationData = @{
            user = $testData.user._id
            task = $testData.task._id
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/notifications" -Method Post -Body $notificationData -ContentType "application/json"
        $testData.notification = $response
        
        Write-Host "✅ Success: Created notification with ID: $($response._id)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping: No test user or task available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Notification creation failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get User Notifications
try {
    if ($testData.user._id) {
        Write-Host "Testing Get User Notifications..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/notifications/user/$($testData.user._id)" -Method Get
        
        Write-Host "✅ Success: Retrieved $(($response | Measure-Object).Count) notifications for user" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping: No test user available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Get user notifications failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Add Dashboard Metric
try {
    if ($testData.user._id -and $testData.task._id) {
        Write-Host "Testing Add Dashboard Metric..." -ForegroundColor Cyan
        $metricData = @{
            user = $testData.user._id
            task = $testData.task._id
            metric_value = 85
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/dashboard/metric" -Method Post -Body $metricData -ContentType "application/json"
        
        Write-Host "✅ Success: Added metric with value: $($response.metric_value)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping: No test user or task available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Add dashboard metric failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test Get Group Dashboard Metrics
try {
    if ($testData.group._id) {
        Write-Host "Testing Get Group Dashboard Metrics..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/dashboard/group/$($testData.group._id)" -Method Get
        
        Write-Host "✅ Success: Retrieved group metrics" -ForegroundColor Green
        Write-Host "Completion Rate: $($response.completionRate)%" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Skipping: No test group available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: Get group dashboard metrics failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host

# Test clean-up
Write-Host "Do you want to clean up test data (y/n)?" -ForegroundColor Cyan
$cleanupResponse = Read-Host
if ($cleanupResponse -eq "y") {
    Write-Host "Cleaning up test data..." -ForegroundColor Cyan
    
    # Delete notification
    if ($testData.notification._id) {
        try {
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/notifications/$($testData.notification._id)" -Method Delete
            Write-Host "✅ Deleted test notification" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to delete notification" -ForegroundColor Red
        }
    }
    
    # Delete task
    if ($testData.task._id) {
        try {
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/tasks/$($testData.task._id)" -Method Delete
            Write-Host "✅ Deleted test task" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to delete task" -ForegroundColor Red
        }
    }
    
    # Delete member
    if ($testData.member._id) {
        try {
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/members/$($testData.member._id)" -Method Delete
            Write-Host "✅ Deleted test member" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to delete member" -ForegroundColor Red
        }
    }
    
    # Delete group
    if ($testData.group._id) {
        try {
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/groups/$($testData.group._id)" -Method Delete
            Write-Host "✅ Deleted test group" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to delete group" -ForegroundColor Red
        }
    }
    
    # Delete user
    if ($testData.user._id) {
        try {
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/users/$($testData.user._id)" -Method Delete
            Write-Host "✅ Deleted test user" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to delete user" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Test data cleanup skipped. Resources were not deleted." -ForegroundColor Yellow
}

Write-Host
Write-Host "========================================="
Write-Host "            TEST RUN COMPLETE            "
Write-Host "========================================="