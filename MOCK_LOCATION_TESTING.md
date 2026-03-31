# Mock Location Testing Guide

## ⚠️ Access Restriction
This feature is **restricted to authorized administrators only** and requires a specific access token: `crs-ygn-admin-10`

If you see a "restricted to authorized administrators" message in the Admin Dashboard, you don't have access to mock location testing.

## Overview
For testing proximity alerts without physically traveling to Yangon, use the **Mock Location Manager** in the Admin Dashboard (if you have the required access token).

## How It Works

### 1. Enable Mock Location
- Navigate to the **Admin Dashboard**
- Find the "Mock Location for Testing" card at the top
- Click any Yangon township button to activate that location
- Your simulated location is now active (shown in the blue info box)

### 2. Test Proximity Alerts
- Go to the **Alerts** page
- Enable "Proximity Alerts"
- Set your desired alert radius (e.g., 1 km)
- The system will treat you as if you're in the selected township
- Any reports within your radius will trigger proximity alerts

### 3. Clear Mock Location
- Click the **X button** in the active location box to remove the mock location
- The system will revert to using real GPS if available

## Available Yangon Townships for Testing

| Township | Coordinates | Use Case |
|----------|-------------|----------|
| Dagon | 16.8281, 96.1735 | Downtown Yangon |
| Botataung | 16.7711, 96.1913 | Port area |
| Pazundaung | 16.7826, 96.1807 | Eastern district |
| Kyauktada | 16.7775, 96.1608 | Central area |
| ... | ... | (See MockLocationManager.tsx for full list of 20 townships) |

## Technical Details

### What Gets Modified
The mock location overrides the browser's real geolocation. The `useGeolocation` hook checks for mock location first:
1. If mock location exists → use it
2. If not → use real GPS if available
3. Else → return error

### Storage
Mock locations are stored in browser `localStorage` under the key `mock-geolocation`:
```json
{
  "latitude": 16.8281,
  "longitude": 96.1735,
  "accuracy": 10
}
```

### Clearing Mock Location Programmatically
```typescript
import { setMockLocation } from "@/hooks/useGeolocation";

// Clear mock location
setMockLocation(null);

// Or set a new one
setMockLocation({
  latitude: 16.8281,
  longitude: 96.1735,
  accuracy: 10
});
```

## Testing Workflow Example

1. **Admin Login** → Admin Dashboard (with token `crs-ygn-admin-10`)
2. **Select a Township** → e.g., "Dagon"
3. **Enable Proximity Alerts** → Go to Alerts page
4. **Set Alert Radius** → e.g., 1 km (1000 meters)
5. **Create/View Reports** → Reports near Dagon township will trigger alerts
6. **Test Different Locations** → Switch townships and verify alerts update

## Security Notes

- The allowed token is hardcoded as `crs-ygn-admin-10` in the component
- Token validation happens on the frontend (check localStorage `access_token`)
- This is a development/testing feature and should only be available to trusted administrators
- Mock location is stored in localStorage and persists across page refreshes

## Push Notifications Testing

### How to Test Push Notifications

1. **Go to Alerts Page** → Enable "Proximity Alerts"
2. **Enable Push Notifications** → Click the toggle under "Push Notifications"
3. **Grant Browser Permission** → Your browser will ask for notification permission
4. **Send Test Notification** → Click "Send Test Notification" button (appears when push is enabled)
   - **Desktop**: You should see a notification popup
   - **Mobile**: You should see a notification in your notification center
5. **Test with Real Alerts**:
   - After mock location is set and proximity alerts are enabled
   - When new reports appear within your radius, notifications will be sent automatically

### Requirements for Phone Notifications

Push notifications work on your phone through the browser's **Service Worker**. The setup includes:

✅ **Service Worker** registered (`/public/service-worker.js`)
✅ **Web App Manifest** configured (`/public/manifest.json`)
✅ **Notification Permission** granted by user
✅ **Push Notifications Enabled** in settings

### Troubleshooting Phone Notifications

**Problem**: No notifications on phone
- Ensure you're using HTTPS (required for production) or localhost for development
- Check browser notification settings - make sure browser has permission
- Try the "Send Test Notification" button first to verify setup
- Check browser console (F12) for error messages

**Problem**: Notifications show on desktop but not phone
- Some browsers on iOS have limited notification support
- Android Chrome should support full notifications
- Try keeping the app in focus first, then test with app minimized

**Problem**: Notification permission not appearing
- Clear site data and reload
- Try incognito/private browsing mode
- Check if notifications are globally disabled in phone settings

### Testing Steps

1. **Set Mock Location** → Admin Dashboard, select Yangon township
2. **Enable Alerts** → Alerts page, toggle "Proximity Alerts"
3. **Enable Notifications** → Toggle "Push Notifications" and grant permission
4. **Test with Test Button** → "Send Test Notification" appears when enabled
5. **Monitor Nearby Reports** → Alerts will show in UI and trigger notifications
6. **Check Console** → Open DevTools (F12) to see notification logs:
   - `✅ Service Worker registered`
   - `📍 Mock Location Detected`
   - `📢 Sending notification via Service Worker`
   - `Found X nearby alerts`

