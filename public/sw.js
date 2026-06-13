self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Streak Counter', body: event.data.text() };
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'Streak Counter', {
        body: data.body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'streak-reminder',
        data: { url: '/today' },
      }),
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => client.postMessage({ type: 'PLAY_NOTIFICATION_TONE' }));
      }),
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/today') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/today');
      }
    })
  );
});
