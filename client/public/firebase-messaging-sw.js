importScripts('https://www.gstatic.com/firebasejs/8.6.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.2/firebase-messaging.js');
//importScripts('https://www.gstatic.com/firebasejs/8.6.2/firebase-analytics.js');

var config = {
    apiKey: "AIzaSyCwP9nlWcBZKklVuMX0Qlrd0nFI_6TDeac",
    authDomain: "netiz-c582a.firebaseapp.com",
    databaseURL: "https://netiz-c582a.firebaseio.com",
    projectId: "netiz-c582a",
    storageBucket: "netiz-c582a.appspot.com",
    messagingSenderId: "221293524301",
    appId: "1:221293524301:web:688bbad1d0d339fd5f3304",
    measurementId: "G-001FC9B6ZC"
    //playnee
}

firebase.initializeApp(config);
//firebase.analytics();

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    const title = 'Hello world!';
    const options = {
        body: payload.data.status
    };
    return self.registration.showNotification(title, options);
})
