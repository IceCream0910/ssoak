import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyCEMZF03973g8X82BNCl-1NlH_Txenfc6s",
    authDomain: "uniterview.firebaseapp.com",
    projectId: "uniterview",
    storageBucket: "uniterview.appspot.com",
    messagingSenderId: "417418078068",
    appId: "1:417418078068:web:cf6e921bb3ea9ca954ee21"
};

const firebasedb = initializeApp(firebaseConfig);

export default firebasedb;