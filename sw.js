const CACHE = "rozklad-offline";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

Notification.requestPermission().then((result) => {
    if (result === "granted") {
      setTimeout(function(){
          const now = new Date();
          const now_ts = now.getTime();
          $("[time]").each(function(){
              diff_time = $(this).attr("time") - now_ts
              if(diff_time > 0 && diff_time < (35 * 60 * 1000)){
                  const options = {
                    body: $(this).text()
                  }
                  alert($(this).text());
                  new Notification("rozklad", options);
                  $(this).removeAttr("time");
              }
            });
        }, 5000);
    }
});

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);
