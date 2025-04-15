# CareBear Backend

This document provides an overview of the CareBear backend API, including details about the TypeScript migration, API structure, and how to test the endpoints.

## Table of Contents

- [Migration from JavaScript to TypeScript](#migration-from-javascript-to-typescript)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Running the Backend](#running-the-backend)
- [Testing the API](#testing-the-api)
- [Database Configuration](#database-configuration)
- [API Endpoints Documentation](#api-endpoints-documentation)

## Migration from JavaScript to TypeScript

The CareBear backend has been successfully migrated from JavaScript to TypeScript. This migration brings several benefits:

- **Type Safety**: TypeScript adds static typing to the codebase, helping catch errors during development.
- **Enhanced IDE Support**: Better autocompletion, navigation, and refactoring tools.
- **Better Documentation**: Types serve as documentation, making the code more readable and maintainable.
- **Improved Maintainability**: Type checking makes the codebase more robust when making changes.

### Migration Process

The migration process included the following steps:

1. **Setting up TypeScript**: Installed TypeScript and necessary type definitions.
   ```
   npm install typescript @types/express @types/node @types/cors --save-dev
   ```

2. **TypeScript Configuration**: Created a `tsconfig.json` file to configure the TypeScript compiler.

3. **Type Definitions**: Created interfaces and types for MongoDB models in `types/models.ts`.

4. **Converted Files**: Migrated all JavaScript files to TypeScript:
   - Models
   - Controllers
   - Routes
   - Configuration files
   - Main application file

5. **Fixed Type Issues**: Resolved typing issues, especially around MongoDB ObjectId handling.

## Project Structure

The backend follows a standard MVC-like structure:

```
backend/
├── app.ts                  # Main application file
├── config/
│   └── db.ts               # Database configuration
├── controllers/            # Request handlers
├── models/                 # MongoDB schema definitions
├── routes/                 # API endpoint routes
├── types/                  # TypeScript type definitions
├── test-api.ps1            # PowerShell API testing script
└── test-api.ts             # TypeScript API testing script
```

## API Overview

The CareBear API provides endpoints for managing:

- **Users**: User accounts and authentication
- **Groups**: Care groups that users can be part of
- **Members**: Group membership with different roles (admin, caregiver, carereceiver)
- **Tasks**: Tasks assigned within groups
- **Notifications**: Updates and notifications for users
- **Dashboard**: Metrics and statistics

The API follows RESTful principles and uses JSON for data exchange.

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

### Important Notes

1. **ObjectId Handling**: All entities (users, groups, tasks, etc.) now use MongoDB's auto-generated ObjectIds as their primary identifiers:
   - Users are identified by their MongoDB `_id` rather than a user-created ID
   - This simplifies the API and makes it more consistent across all resources
   - When retrieving or referencing any entity, always use its MongoDB `_id`

2. **Error Handling**: The API returns appropriate HTTP status codes with error messages in JSON format:
   ```json
   {
     "error": "Error message details"
   }
   ```

3. **Relationships**: The API uses MongoDB ObjectIds to establish relationships between different entities (users, groups, tasks, etc.).

### Recent Changes

#### User Model Updates (April 2025)

We've made significant changes to how users are identified in the system:

1. **Username Instead of UserID**: 
   - Changed the field `userID` to `username` for better clarity
   - Username is now optional during signup and will be auto-generated if not provided
   - Auto-generated usernames are based on the user's name plus a random string

2. **MongoDB ObjectID as Primary Identifier**: 
   - All users are now primarily identified by their MongoDB-generated ObjectID
   - All relationships between entities (groups, tasks, etc.) use MongoDB ObjectIDs
   - API endpoints support lookups by either ObjectID or username for backward compatibility

3. **User Routes Update**:
   - Changed route parameters from `:userID` to `:id` for consistency
   - Added a new route to get all users: `GET /api/users`

4. **User-Friendly Experience**:
   - Users no longer need to create their own identifier
   - Email and name are the only required fields for signup
   - Auto-generated usernames are human-readable

### Important Notes

1. **ObjectId and Username Handling**: 
   - MongoDB ObjectIDs (e.g., `67fe681f53c0bcf0bfd7db86`) are the primary identifiers for all entities
   - Users also have a human-readable username that can be used in lookups
   - When creating relationships between entities, always use the MongoDB ObjectID

2. **Error Handling**: The API returns appropriate HTTP status codes with error messages in JSON format:
   ```json
   {
     "error": "Error message details"
   }
   ```

3. **Relationships**: The API uses MongoDB ObjectIds to establish relationships between different entities (users, groups, tasks, etc.).

## API Usage Notes and Important Considerations

After comprehensive testing of all endpoints, here are some important notes and considerations when using the CareBear API:

### General API Behavior

1. **Response Format**: All successful responses return JSON data with appropriate HTTP status codes (200 for success, 201 for creation).
2. **Error Handling**: Error responses include a consistent format with an error message and appropriate HTTP status codes (400, 404, 500).
3. **MongoDB ObjectIDs**: All resources (users, groups, tasks, etc.) use MongoDB-generated ObjectIDs as their primary identifiers. These IDs should be used when referencing resources across requests.
4. **Cascading Deletes**: When deleting parent resources (like groups), associated resources (like members) are automatically deleted.

### User Management

1. **User Identification**: Users can be identified by either their MongoDB ObjectID or their username in API endpoints.
2. **Auto-generated Usernames**: If a username is not provided during signup, the system will auto-generate one based on the user's name plus a random string.
3. **Email Uniqueness**: Emails must be unique. Attempting to create a user with an existing email will result in a 400 error.
4. **User Login**: The login endpoint requires only an email and returns the full user object.

### Group Management

1. **Group Creation Side Effect**: When creating a group, the creator user is **automatically added as an admin member** to the group. This is important to remember when working with group memberships.
2. **Group Deletion**: Deleting a group will also delete all associated memberships, but tasks related to the group should be manually managed.
3. **Group Access**: Groups can be accessed by all users, but operations like update and delete should be restricted by your application logic to appropriate roles.

### Member Management

1. **Duplicate Prevention**: A user cannot be added to a group more than once. The API will return a 400 error if you attempt to add a user who is already a member.
2. **Member Roles**: Valid roles are 'admin', 'caregiver', and 'carereceiver', with different implied permissions.
3. **Admin Requirement**: It's recommended to always maintain at least one admin member in a group, but the API doesn't enforce this.
4. **Role Updates**: A member's role can be changed at any time without restrictions (e.g., from 'admin' to 'carereceiver').

### Task Management

1. **Task Properties**: Tasks include properties like assignedBy, assignedTo, status, description, deadline, and priority.
2. **Task Status Updates**: Task status can be updated separately from other fields using the dedicated status update endpoint.
3. **Status Values**: Valid status values are 'pending', 'in-progress', and 'done'.
4. **Priority Values**: Valid priority values are 'low', 'medium', and 'high'.
5. **Deadline Format**: Dates should be provided in ISO-8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).

### Notification System

1. **Notification Creation**: Notifications are tied to both a user and a task.
2. **No Auto-notifications**: The API does not automatically create notifications when tasks are assigned or updated - your application needs to explicitly create notifications.
3. **Notification Deletion**: Reading a notification should be implemented by deleting it or using the markAsRead endpoint.

### Dashboard and Metrics

1. **Dashboard Data**: The dashboard endpoints provide aggregated information like completed tasks, pending tasks, and completion rates.
2. **Metrics Storage**: The API allows storing arbitrary metric values associated with user-task pairs.
3. **Group Metrics**: Group metrics calculate statistics across all tasks in a group.
4. **User Metrics**: User metrics include all metrics specifically recorded for that user plus their completed task count.

### Testing and Development

1. **Test Suite Coverage**: The API comes with comprehensive test scripts (TypeScript and PowerShell) that verify all endpoints.
2. **API Health Check**: Use the root endpoint (`/`) to check if the API is running.
3. **Environment Configuration**: API configuration like database connection and port is managed through environment variables in the `.env` file.

### Common Patterns and Relationships

1. **Group → Members → Users**: Groups have members, which reference users with specific roles.
2. **Tasks → Users & Groups**: Tasks are associated with groups and reference users as assigners and assignees.
3. **Notifications → Users & Tasks**: Notifications link users to tasks requiring attention.

### Important Implementation Details

1. **Route Ordering**: The API uses specific route ordering to ensure that more specific routes like `/user/:id` are matched before generic routes like `/:id`.
2. **MongoDB References**: The API uses proper MongoDB references between models, allowing for population of related data.
3. **Validation**: Basic validation is implemented at the schema level (required fields, enum values).
4. **Error Handling**: The API includes centralized error handling but relies on proper validation at the business logic level.

By understanding these behaviors and considerations, you can correctly integrate with the CareBear API and build robust frontend applications that properly handle the data flow and relationships between resources.