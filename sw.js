const CACHE = "rozklad-offline";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);

if (! Cookie.get("notification")){
    Notification.requestPermission().then((result) => {
        if (result === "granted") {
          Cookies.set("notification","1");
        }
    });
}
