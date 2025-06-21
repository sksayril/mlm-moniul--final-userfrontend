# MLM Customer Frontend - Session Management

## Enhanced Session Management Features

This application now includes robust session management with automatic logout and redirection functionality.

### Key Features:

1. **Session Expiration Handling**
   - Sessions automatically expire after 30 minutes of inactivity
   - Users are automatically redirected to `/login` when session expires
   - Session data is stored in `sessionStorage` (clears when browser tab closes)

2. **Authentication State Management**
   - All authenticated routes redirect to `/login` when session is invalid
   - Unauthenticated users trying to access protected routes are redirected to `/login`
   - Default route redirects to `/login` for unauthenticated users

3. **Activity Tracking**
   - User activity is tracked (mouse movements, clicks, keyboard input)
   - Session is automatically extended on user activity
   - Aggressive timeout when browser tab is hidden (5 minutes)

4. **API Error Handling**
   - All API calls check for authentication errors (401/403)
   - Automatic logout and redirect to login on authentication failures
   - Session validation before making API requests

### Routes:

- `/login` - User login page
- `/register` - User registration page (accessible without authentication)
- `/dashboard` - Protected dashboard (requires authentication)
- `/*` - Any other route redirects to `/login` if not authenticated

### Session Management Components:

#### SessionManager Class (App.tsx)
- `setSession(token, userData)` - Store session data
- `getSession()` - Get current session (validates expiration)
- `clearSession()` - Clear session data
- `extendSession()` - Extend session timestamp
- `isValidSession()` - Check if current session is valid
- `forceLogout()` - Force logout and redirect to login

#### Dashboard Session Utilities
- `getSessionToken()` - Get token with validation
- `checkSessionAndRedirect()` - Check session before API calls
- `handleAuthError()` - Handle API authentication errors

### Usage Flow:

1. User logs in → Session is created with 30-minute timeout
2. User activity extends session automatically
3. API calls validate session before execution
4. Authentication errors trigger automatic logout
5. Session expiration redirects user to login page
6. Tab close/refresh clears session data

### Security Features:

- Session data stored in `sessionStorage` (more secure than `localStorage`)
- Automatic session clearing on tab close
- Session timeout validation on every API call
- Immediate logout on authentication errors
- Activity-based session extension

This ensures users are always redirected to the login page when their session is invalid or expired, providing a secure and user-friendly authentication experience. 