import firebase from 'firebase';
import api from './api'

export const initFirebase = () => {

    console.log('Entrou no PUSH-NOTIFICATION')
    localStorage.setItem('pushnotificationLoaded', false)
    console.log(localStorage.getItem('pushnotificationLoaded'))

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

    if ('serviceWorker' in navigator) {        
        console.log('registrando firebaseWS');
        const swUrl = window.location.origin + '/firebase-messaging-sw.js';
        //const swUrl = '../../firebase-messaging-sw.js';
        console.log(swUrl);
        navigator.serviceWorker
            .register(swUrl)
            .then((registration) => {
                firebase.messaging().useServiceWorker(registration);
            });
    }

    localStorage.setItem('pushnotificationLoaded', true)
    console.log(localStorage.getItem('pushnotificationLoaded'))
}

export const askForPermission = async () => {

    console.log('ENTROU NO ASK PERMISSION')
    try {

        const messaging = firebase.messaging();

        messaging.requestPermission()
            .then(function () {
                console.log("Permissão concedida para notificações.");
                return messaging.getToken()
            })
            .then(async function (token) {
                //console.log('token do usuário:');
                //console.log(token);

                const response = await api.post('/security/devices', {
                    codigo: "web_browser",
                    token: token,
                    type: "web browser"	
                })

                const data = await response.data
                localStorage.setItem('pushnotificationToken', token)

            })
            .catch(function (err) {
                console.log("Falha ao pedir permissão para notificação.", err);
            });

        messaging.onMessage(function (payload) {
            console.log('onMessage: ', payload);

        });

    } catch (error) {
        console.error(error);
    }
}