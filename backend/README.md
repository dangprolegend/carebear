# CareBear Backend

Update of migration


## Running the Backend

To run the backend server:

1. Ensure MongoDB is running or a valid MongoDB connection string is available.

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. For production:
   ```
   npm run build
   npm start
   ```

The server will run on port 5000 by default (configurable in `.env`).

## Testing the API

The backend includes two testing scripts:

### PowerShell Testing Script

Run the PowerShell script to test API endpoints:

```powershell
./test-api.ps1
```

This script tests:
- Health check endpoint
- User creation and retrieval
- Group creation and listing
- Task creation and listing

### TypeScript Testing Script

Run the TypeScript testing script:

```bash
npx tsx test-api.ts
```

This script provides more detailed testing with proper error handling and sequential testing.

## Database Configuration

The backend connects to a MongoDB database. Configuration can be set in the `.env` file:

```
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Server Port
PORT=5000
```

## API Endpoints Documentation

### User Endpoints

#### Create User (Signup)
- **URL**: `/api/users/signup`
- **Method**: `POST`
- **Data Params**:
  ```json
  {
    "email": "user@example.com",
    "name": "User Name",
    "username": "custom_username" // Optional - will be auto-generated if not provided
  }
  ```
- **Success Response**: `201 Created` with user object including auto-generated MongoDB ObjectID and username
- **Note**: Users are identified primarily by their MongoDB ObjectID. A readable username is automatically generated from the user's name if not provided.

#### User Login
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Data Params**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response**: `200 OK` with user object

#### Get User
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Notes**: The `:id` parameter can be either:
  - A MongoDB ObjectID (e.g., `67fe681f53c0bcf0bfd7db86`)
  - A username (e.g., `testuser_abc123`)
- **Success Response**: `200 OK` with user object

#### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Success Response**: `200 OK` with array of users

#### Update User
- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Notes**: The `:id` parameter can be either a MongoDB ObjectID or username
- **Data Params**: Any user fields to update
- **Success Response**: `200 OK` with updated user object

#### Delete User
- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **Notes**: The `:id` parameter can be either a MongoDB ObjectID or username
- **Success Response**: `200 OK` with success message

### Group Endpoints

#### Create Group
- **URL**: `/api/groups`
- **Method**: `POST`
- **Data Params**:
  ```json
  {
    "name": "Group Name",
    "userID": "userId"
  }
  ```
- **Success Response**: `201 Created` with group object

#### Get All Groups
- **URL**: `/api/groups`
- **Method**: `GET`
- **Success Response**: `200 OK` with array of groups

#### Get Group by ID
- **URL**: `/api/groups/:id`
- **Method**: `GET`
- **Success Response**: `200 OK` with group object

### Member Endpoints

#### Add Member to Group
- **URL**: `/api/members`
- **Method**: `POST`
- **Data Params**:
  ```json
  {
    "userID": "userId",
    "groupID": "groupId",
    "role": "admin|caregiver|carereceiver"
  }
  ```
- **Success Response**: `201 Created` with member object

#### Get Group Members
- **URL**: `/api/members/group/:groupID`
- **Method**: `GET`
- **Success Response**: `200 OK` with array of members

### Task Endpoints

#### Create Task
- **URL**: `/api/tasks`
- **Method**: `POST`
- **Data Params**:
  ```json
  {
    "userID": "creatorId",
    "groupID": "groupId",
    "assignedBy": "assignerId",
    "assignedTo": "assigneeId",
    "description": "Task description",
    "priority": "low|medium|high",
    "deadline": "2025-04-30" // Optional
  }
  ```
- **Success Response**: `201 Created` with task object

#### Get Tasks for Group
- **URL**: `/api/tasks/group/:groupID`
- **Method**: `GET`
- **Success Response**: `200 OK` with array of tasks

#### Get Tasks for User
- **URL**: `/api/tasks/user/:userID`
- **Method**: `GET`
- **Success Response**: `200 OK` with array of tasks
 full user object.

By understanding these behaviors and considerations, you can correctly integrate with the CareBear API and build robust frontend applications that properly handle the data flow and relationships between resources.
