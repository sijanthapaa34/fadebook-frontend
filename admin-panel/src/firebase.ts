// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "REMOVED",
  authDomain: "fadebook-99ab5.firebaseapp.com",
  projectId: "fadebook-99ab5",
  storageBucket: "fadebook-99ab5.firebasestorage.app",
  messagingSenderId: "431905664183",
  appId: "1:431905664183:web:cf8b55d8d03a1996953132",
  measurementId: "G-6YN76PGGKX"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = () => {
  return getToken(messaging, { vapidKey: "YOUR_WEB_PUSH_CERTIFICATE_KEY_PAIR" }) // Found in Firebase Console -> Web App Config -> Web Push Certificates
    .then((currentToken) => {
      if (currentToken) {
        console.log('Current token for client: ', currentToken);
        // Send to backend using same API as mobile
        fetch('/api/notifications/token', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            body: currentToken
        });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    })
    .catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});