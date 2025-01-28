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

function getCookieValue(cookieName) {
  var cookies = document.cookie.split("; ");
  for (var i = 0; i < cookies.length; i++) {
      var cookieParts = cookies[i].split("=");
      var name = cookieParts[0].trim();
      var value = cookieParts[1];
      if (name === cookieName) {
          return value;
      }
  }
  return null;
}

function setCookie(cookieName, cookieValue, expirationDays) {
  var d = new Date();
  d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

if (! getCookieValue("notification")){
    Notification.requestPermission().then((result) => {
        if (result === "granted") {
          setCookie("notification","1",700);
        }
    });
}
