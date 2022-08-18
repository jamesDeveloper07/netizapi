var NETIZ_APP = 'netiz-app';
var CACHE_VERSION = 'v1';
var NETIZ_OFFLINE = 'netiz-offline';

var urlsToCache = [
    './icon.png',
    '/css?family=Open+Sans',
    '/icon?family=Material+Icons',
    './assets/img/offline.png',
    './offline.html',
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(NETIZ_APP + CACHE_VERSION)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) {

    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(event.request.url).catch(error => {
                // Return the offline page
                console.log(error)
                return caches.match('/offline.html');
            })
        );
    }
    else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
                )
        );
    }
});  