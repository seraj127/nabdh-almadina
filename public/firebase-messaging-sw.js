// ─── Firebase Cloud Messaging Service Worker ─────────────────
// Handles push notifications for the نبض المدينة web app

// Listen for push events
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { notification: { title: 'نبض المدينة', body: event.data.text() } };
    }
  }

  const title = data.notification?.title || 'نبض المدينة';
  const body = data.notification?.body || 'لديك إشعار جديد';
  const icon = data.notification?.icon || '/icon-192.png';
  const badge = data.notification?.badge || '/icon-128.png';
  const url = data.data?.url || '/';

  const options = {
    body,
    icon,
    badge,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    data: {
      url,
      ...data.data,
    },
    actions: [
      { action: 'open', title: 'فتح' },
      { action: 'dismiss', title: 'إغلاق' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  // The app will re-register the token on next launch
});
