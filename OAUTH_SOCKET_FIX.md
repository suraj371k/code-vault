# Google OAuth Socket Connection Fix

## Problem Identified

Your chatbot was not working when users logged in with Google OAuth but worked fine with email/password login. The root causes were:

1. **Missing Socket Authentication**: The socket connection didn't verify JWT tokens, so any connection failure was silent
2. **Socket Connection Not Established After OAuth**: The callback page stored the token but never connected the socket
3. **CORS Configuration**: While the backend already used environment variables, credentials weren't explicitly enabled

## Changes Made

### Backend Changes

#### 1. Enhanced Socket.io Configuration (`backend/src/lib/socket.ts`)
- ✅ Added JWT authentication middleware for socket connections
- ✅ Enabled `credentials: true` for CORS
- ✅ Added user verification to prevent impersonation
- ✅ Enhanced logging for debugging connection issues

**Key additions:**
```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.data.userId = (decoded as any).userId;
    next();
  });
});
```

### Frontend Changes

#### 2. Updated Socket Connection Module (`frontend/lib/socket.ts`)
- ✅ Created `connectSocket()` function that accepts authentication token
- ✅ Added `withCredentials: true` for CORS
- ✅ Implemented proper socket instance management
- ✅ Added `disconnectSocket()` for cleanup

#### 3. Updated OAuth Callback Page (`frontend/app/(auth)/callback/page.tsx`)
- ✅ Now calls `connectSocket(token)` after storing token
- ✅ Added error handling for socket connection failures
- ✅ Improved user experience with better error messages

#### 4. Updated Login Hook (`frontend/hooks/auth/useLogin.tsx`)
- ✅ Automatically connects socket after successful login
- ✅ Graceful error handling if socket connection fails
- ✅ Doesn't block login flow if socket fails

#### 5. Updated Signup Hook (`frontend/hooks/auth/useSignup.tsx`)
- ✅ Same improvements as login hook for consistency

## Production Deployment Checklist

### 1. Backend Environment Variables

Ensure these are set in your production environment:

```bash
# Production Frontend URL
CORS_ORIGIN=https://your-production-domain.com

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
REDIRECT_URI=https://your-backend-domain.com/api/auth/google/callback

# JWT Secret (keep secure!)
JWT_SECRET=your-secure-jwt-secret

# Other required variables
DATABASE_URL=your-production-database-url
DIRECT_URL=your-production-direct-database-url
PORT=5001
GEMINI_API_KEY=your-gemini-api-key
REDIS_URL=your-redis-url
SESSION_SECRET=your-session-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PRICE_PRO=your-stripe-price-id
STRIPE_PRICE_ENTERPRISE=your-stripe-price-id
```

### 2. Frontend Environment Variables

Update your production frontend environment:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### 3. Google OAuth Console Configuration

In your Google Cloud Console (https://console.cloud.google.com):

1. Go to **APIs & Services → Credentials**
2. Update your OAuth 2.0 Client ID:
   - **Authorized JavaScript origins**: Add `https://your-production-domain.com`
   - **Authorized redirect URIs**: Add `https://your-backend-domain.com/api/auth/google/callback`

### 4. Testing the Fix

After deployment, test both authentication methods:

**Email/Password Login:**
```
1. Go to /login
2. Enter email and password
3. Click Login
4. Check browser console: Should see "Socket authenticated for user: [userId]"
5. Verify chatbot functionality
```

**Google OAuth Login:**
```
1. Go to /login
2. Click "Continue with Google"
3. Complete Google authentication
4. Should redirect to /callback then to dashboard
5. Check browser console: Should see "Socket authenticated for user: [userId]"
6. Verify chatbot functionality
```

## Debugging Socket Issues

If socket connection still fails in production:

### Backend Logs to Check:
```
✅ "Socket authenticated for user: [userId]" - Authentication successful
❌ "Socket connection attempted without token" - Token not provided
❌ "Socket authentication failed: [error]" - Invalid token
```

### Frontend Console to Check:
```javascript
// Check if socket is connected
import { getSocket } from '@/lib/socket';
const socket = getSocket();
console.log('Socket connected:', socket.connected);
console.log('Socket auth:', socket.auth);
```

### Common Issues and Solutions:

**Issue 1: "Authentication error: No token provided"**
- **Cause**: Socket connecting before token is stored
- **Fix**: Ensure `connectSocket(token)` is called AFTER `localStorage.setItem()`

**Issue 2: "Authentication error: Invalid token"**
- **Cause**: JWT_SECRET mismatch or expired token
- **Fix**: Verify JWT_SECRET is the same in production as used to sign tokens

**Issue 3: CORS errors**
- **Cause**: CORS_ORIGIN doesn't match frontend domain
- **Fix**: Update CORS_ORIGIN in backend .env to exact production URL

**Issue 4: WebSocket connection failed**
- **Cause**: Firewall or proxy blocking WebSocket connections
- **Fix**: Ensure your hosting provider supports WebSocket connections

## File Summary

Files modified in this fix:

```
backend/
  src/
    lib/
      socket.ts ✅ Added JWT authentication middleware

frontend/
  lib/
    socket.ts ✅ Created connectSocket() with token auth
  app/
    (auth)/
      callback/
        page.tsx ✅ Calls connectSocket() after OAuth
  hooks/
    auth/
      useLogin.tsx ✅ Connects socket on successful login
      useSignup.tsx ✅ Connects socket on successful signup
```

## Need Help?

If you encounter issues after deployment:

1. Check backend logs for socket authentication errors
2. Check browser console for connection errors
3. Verify all environment variables are correctly set
4. Test with both authentication methods
5. Enable detailed logging by adding `debug: true` to socket.io config (temporarily)

---

**Created**: April 18, 2026
**Status**: ✅ Ready for Production Deployment
