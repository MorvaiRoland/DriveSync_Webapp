# PWA Features Documentation

This document outlines the new Progressive Web App (PWA) features implemented in DynamicSense.

## Features Implemented

### 1. **Enhanced Service Worker**
- **File**: `public/service-worker.js`
- **Capabilities**:
  - Network-first caching strategy for API calls
  - Cache-first strategy for images
  - Stale-while-revalidate for HTML/JS/CSS
  - Offline fallback pages
  - Push notification support
  - Background sync for offline actions

### 2. **Offline Support**
- **Component**: `OfflineIndicator.tsx`
- **Features**:
  - Automatic offline/online detection
  - Visual indicator showing connection status
  - Auto-dismiss notification when connection restored
  - Notifications about data syncing

**Usage**:
Already included in root layout. Shows automatically when user goes offline.

### 3. **PWA Install Prompt**
- **Component**: `PWAInstallPrompt.tsx`
- **Features**:
  - Native browser install prompt on supported browsers
  - iOS-specific instructions for home screen addition
  - "Ask Later" functionality (hides for 7 days)
  - Smart detection of already-installed app

**Usage**:
Already included in root layout. Shows automatically on supported devices.

### 4. **Camera/Photo Capture**
- **Component**: `CameraCapture.tsx`
- **Features**:
  - Access device camera with environment-facing setting
  - Take photos of vehicles
  - Upload from device file system
  - Photo preview and confirmation
  - Timestamp-based file naming

**Usage**:
```tsx
import CameraCapture from '@/components/CameraCapture';

export default function MyComponent() {
  const handleCapture = async (blob: Blob, fileName: string) => {
    // Upload or process the captured image
    const formData = new FormData();
    formData.append('file', blob, fileName);
    // Send to API
  };

  return (
    <CameraCapture 
      onCapture={handleCapture}
      label="📸 Capture Car Photo"
    />
  );
}
```

### 5. **Push Notifications**
- **Service**: `lib/notifications.ts`
- **Features**:
  - Request notification permissions
  - Send local notifications
  - Subscribe/unsubscribe to push notifications
  - Notification click handling
  - Schedule client-side reminders

**Usage**:
```tsx
import { sendLocalNotification, requestNotificationPermission } from '@/lib/notifications';

// Request permission
const hasPermission = await requestNotificationPermission();

// Send a notification
if (hasPermission) {
  await sendLocalNotification({
    title: 'Service Reminder',
    body: 'Your oil change is due soon',
    tag: 'service-reminder',
    requireInteraction: true,
  });
}
```

### 6. **Notification Hook**
- **Hook**: `lib/useNotifications.ts`
- **Features**:
  - React hook for managing notifications in components
  - Helper functions for common notification types
  - Permission checking and management

**Usage**:
```tsx
import { useNotifications, sendReminderNotification } from '@/lib/useNotifications';

export default function MyComponent() {
  const { sendNotification, hasPermission } = useNotifications();

  const handleAction = async () => {
    if (hasPermission) {
      await sendNotification({
        title: 'Success',
        body: 'Action completed',
      });
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### 7. **Notification Settings**
- **Component**: `NotificationSettings.tsx`
- **Features**:
  - Toggle notifications on/off
  - Check browser support
  - Error handling and user feedback
  - Permission management

**Usage**:
```tsx
import NotificationSettings from '@/components/NotificationSettings';

export default function SettingsPage() {
  return (
    <div>
      <NotificationSettings />
    </div>
  );
}
```

### 8. **Offline Page**
- **Route**: `/offline`
- **Features**:
  - User-friendly offline message
  - Connection retry button
  - Back to home navigation
  - Data sync information

## Integration Examples

### Add Photo Capture to Car Details
```tsx
'use client';

import CameraCapture from '@/components/CameraCapture';
import { useState } from 'react';

export default function CarDetailsPage() {
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoCapture = async (blob: Blob, fileName: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('car_id', carId);
      
      const response = await fetch('/api/cars/photos', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Success - show notification
        await sendSuccessNotification('Photo uploaded', 'Your car photo has been saved');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <CameraCapture 
        onCapture={handlePhotoCapture}
        label="📸 Add Photo"
      />
    </div>
  );
}
```

### Send Service Reminder Notification
```tsx
import { sendReminderNotification } from '@/lib/useNotifications';

// When service is due
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 7);

await sendReminderNotification(
  'Service Reminder',
  'Your vehicle is due for service in 7 days',
  {
    carId: car.id,
    dueDate: dueDate.toISOString(),
  }
);
```

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Offline Support | ✅ | ✅ | ✅ | ✅ |
| Install Prompt | ✅ | ✅ | ❌ | ✅ |
| Camera API | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ⚠️ | ✅ |

## Performance Optimization

The enhanced service worker implements:
- **Precaching**: Static assets cached on install
- **Network-first**: API calls use latest data when available
- **Cache-first**: Images cached after first load
- **Stale-while-revalidate**: HTML/CSS/JS serve cached version while updating

## Security Considerations

- Service Worker runs in isolated context
- No sensitive data stored in cache
- HTTPS enforced in production
- Content Security Policy headers configured
- Notification permissions require user consent

## Testing PWA Features

### Test Offline Mode
1. Open DevTools → Application tab
2. Check "Offline" checkbox
3. Reload page
4. Verify offline indicator appears
5. Try navigating between pages
6. Uncheck offline, verify sync notification

### Test Camera
1. On mobile device, click camera button
2. Allow camera permission
3. Take photo
4. Verify preview shows
5. Confirm upload

### Test Install Prompt
1. On Chrome/Edge, wait for install prompt
2. Click "Install"
3. Verify app appears in app drawer/home screen
4. Launch from installed app

### Test Notifications
1. Enable notifications in settings
2. Keep browser open
3. Trigger a notification action
4. Verify notification appears

## Future Enhancements

- [ ] Server-side push notifications with VAPID keys
- [ ] Background sync for queued data uploads
- [ ] Periodic background sync for reminders
- [ ] Payment API integration
- [ ] Contact sharing via Web Share API
- [ ] File handling for importing documents
- [ ] Shortcuts for quick actions

## Troubleshooting

### Notifications not appearing
- Check browser notifications permission
- Verify service worker is registered
- Check browser console for errors

### Offline pages not showing
- Clear cache and reload
- Verify service-worker.js is being registered
- Check HTTPS is enabled

### Camera not working
- Check HTTPS is used (required for camera API)
- Verify camera permission in browser settings
- Test on different browser if available

### Install prompt not showing
- App must meet PWA criteria
- Must be served over HTTPS
- Can only show once every 3 months per domain
