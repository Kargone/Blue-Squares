if (localStorage.getItem('blue-squares:sign-in-type') === null) window.location.href = "/Intro Info/intro-page.html";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { 
    getDatabase,
    child,
    ref,
    set,
    get,
    push, 
    update,
    onDisconnect,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { createGame } from "./script.js";

const firebaseConfig = {
    apiKey: "AIzaSyByhAfobvZt_OQu-32tVbXho6n2L4IaNEE",
    authDomain: "blue-squares-d1f83.firebaseapp.com",
    databaseURL: "https://blue-squares-d1f83-default-rtdb.firebaseio.com",
    projectId: "blue-squares-d1f83",
    storageBucket: "blue-squares-d1f83.appspot.com",
    messagingSenderId: "902439481018",
    appId: "1:902439481018:web:4cc44b28a38a62e8c01c83",
    measurementId: "G-Q5HDHVEEDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const googleUserCred = JSON.parse(localStorage.getItem('blue-squares:user'));
// localStorage.removeItem('user');
const signInType = localStorage.getItem('blue-squares:sign-in-type');
const auth = getAuth();
const db = getDatabase(app);
const dbRef = ref(getDatabase(app));
if (signInType === 'google') {
    await signInWithEmailAndPassword(auth, googleUserCred.email, googleUserCred.uid)
    .then((userCredential) => {
        console.log(userCredential)
        const user = userCredential.user;
        const userId = user.uid;
        notification('Logged in', user.displayName);
        connectToDatabase(user, userId);
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        notification('Sign in with email/password fail');
        console.log(errorCode, errorMessage);
        setTimeout(() => {
        // window.location.href = "/Intro Info/intro-page.html";
        }, 1000);
    });
} else if (signInType === 'anonymous') {
    signInAnonymously(auth).then((userCredential) => {
        console.log(userCredential)
        let user = userCredential.user;
        user.displayName = 'Anonymous';
        const userId = user.uid;
        notification('Logged in', user.displayName);
        connectToDatabase(user, userId);
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        notification('Sign in anonymously fail');
        console.log(errorCode, errorMessage);
        setTimeout(() => {
        // window.location.href = "/Intro Info/intro-page.html";
        }, 1000);
    });
} else {
    window.location.href = "/Intro Info/intro-page.html";
}

function connectToDatabase(user, userId) {
    get(child(dbRef, `users/${userId}`)).then((snapshot) => {
        if (snapshot.exists()) {
            notification('Retrived data')
            if (snapshot.val()['online'] === true) return window.location.href = "/Intro Info/intro-page.html";
            const intialPlayerData = snapshot.val()['game-data'];
            sessionStorage.setItem('blue-squares:intialPlayerData', JSON.stringify(intialPlayerData));
            sessionStorage.setItem('blue-squares:username', snapshot.val()['username']);
            updatePlayerInformation(userId);
        } else {
            notification('Creating new player node');
            sessionStorage.setItem('blue-squares:afk-collected', 0);
            let intialPlayerData = {
                "username": user.displayName,
                "tutorial-step-num": 1,
                "user-settings": {
                    "all-notifications": true,
                    "notification-invalid-movement": true,
                    "notification-not-enough-upgrade": true,
                    "notification-not-enough-new-building": true,
                    "notification-deletion": true,
                    "no-delete": false,
                    "double-tap-buy-plot": true,
                    "double-tap-delete": true,
                    "no-building-movement": false,
                    "open-info-after-building-move": true,
                    "close-info-during-building-move": true,
                    "no-board-movement": false,
                    "close-info-during-board-move": true
                },
                "currencies": {
                    "blue_squares": 0,
                    "red_squares": 0,
                    "green_squares": 0,
                    "purple_squares": 0,
                    "orange_squares": 0,
                    "yellow_squares": 0,
                    "white_squares": 0
                },
                "buy-costs": {
                    "blue_squares": 0,
                    "red_squares": 0,
                    "green_squares": 0,
                    "purple_squares": 0,
                    "orange_squares": 0,
                    "yellow_squares": 0,
                    "white_squares": 0,
                    "blue_collectors": 0,
                    "red_collectors": 0,
                    "green_collectors": 0,
                    "purple_collectors": 0,
                    "orange_collectors": 0,
                    "yellow_collectors": 0,
                    "white_collectors": 0
                },
                "grass-grid": '[["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"]]',
                "building-data": {}
            };
            intialPlayerData['building-data'][Math.floor(Math.random() * 1000000000)] = {
                "level": 1,
                "type": "Blue_square",
                "created-at": Date.now(),
                "total-cost": 0,
                "coordX": 26,
                "coordY": 15
            };
            sessionStorage.setItem('blue-squares:intialPlayerData', JSON.stringify(intialPlayerData));
            sessionStorage.setItem('blue-squares:username', user.displayName);
            set(ref(db, `users/${userId}`), {
                "username": user.displayName,
                "online": true,
                "email-address": user.email,
                "logins": {
                    "login-1": {
                        "device-number": 1,
                        "device-deminsions": `${window.innerWidth}x${window.innerHeight}`,
                        "time": Date.now(),
                        "collected-afk-time": 0,
                        "in-game-time": 0
                    }
                },
                "devices": {
                    "device-1": {
                        "dimensions": `${window.innerWidth}x${window.innerHeight}`,
                        "number-of-logins": 1
                    }
                },
                "total-time-collect-afk": 0,
                "total-in-game-time": 0,
                "total-time": 0,
                "last-time-online": Date.now(),
                "game-data": intialPlayerData
            });
            createGame();
        }
        document.getElementById("loading-screen").style.display = 'none';
        }).catch((error) => {
        notification('Fail to get database');
        console.log(error);
        setTimeout(() => {
        // window.location.href = "/Intro Info/intro-page.html";
        }, 1000);  
    });
}

function updatePlayerInformation(userId) {
    get(child(dbRef, `users/${userId}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const intialPlayerData = snapshot.val();
            let logins = intialPlayerData.logins;
            let devices = intialPlayerData.devices;
            let last_login = logins[`login-${Object.keys(logins).length}`];
            const last_in_game_time = last_login['disconnected-on'] - last_login['connected-on'];
            last_login['in-game-time'] = last_in_game_time;
            const last_time_online = Date.now();
            const afk_collected = last_time_online - intialPlayerData['last-time-online'] - last_in_game_time;
            const total_afk_time = intialPlayerData['total-time-collect-afk'] + afk_collected;
            const total_time = last_time_online - logins['login-1'].time;
            const in_game_time = intialPlayerData['total-in-game-time'] + last_in_game_time;
            sessionStorage.setItem('blue-squares:afk-collected', afk_collected);
            let device_number = 0;
            for (const device_key of Object.keys(devices)) {
            let device = devices[device_key];
            if (device.dimensions === `${window.innerWidth}x${window.innerHeight}`) {
                device['number-of-logins'] += 1;
                device_number = device_key.split('-')[1];
                break;
            }
            }
            if (device_number === 0) {
            devices[`device-${Object.keys(devices).length + 1}`] = {
                "dimensions": `${window.innerWidth}x${window.innerHeight}`,
                "number-of-logins": 1
            };
            device_number = Object.keys(devices).length;
            }
            const login_in_number = Object.keys(logins).length + 1;
            logins[`login-${login_in_number}`] = {
                "device-number": device_number,
                "device-deminsions": `${window.innerWidth}x${window.innerHeight}`,
                "connected-on": Date.now(),
                "collected-afk-time": afk_collected,
                "disconnected-on": Date.now(),
                "in-game-time": 0
            };
            sessionStorage.setItem('blue-squares:login_in_number', login_in_number);
            update(ref(db, `users/${userId}`), {
                "devices": devices,
                "last-time-online": last_time_online,
                "logins": logins,
                "total-time": total_time,
                "total-time-collect-afk": total_afk_time,
                "total-in-game-time": in_game_time,
                "online": true
            });
            const onlineRef = ref(db, `users/${userId}/online`);
            onDisconnect(onlineRef).set(false);
            const inGameTimeRef = ref(db, `users/${userId}/logins/login-${login_in_number}/disconnected-on`);
            onDisconnect(inGameTimeRef).set(serverTimestamp());
        } else {
            notification('Player info no exist');
            setTimeout(() => {
                window.location.href = "/Intro Info/intro-page.html";
            }, 1000); 
        }
        createGame();
        }).catch((error) => {
        notification('Fail to get player info');
        console.log(error);
        setTimeout(() => {
        // window.location.href = "/Intro Info/intro-page.html";
        }, 1000);  
    });
}