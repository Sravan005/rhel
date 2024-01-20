import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwqeerfgu8xdW3crXGcxQ7IT15hHzc0Dw",
  authDomain: "uplifted-kit-368217.firebaseapp.com",
  projectId: "uplifted-kit-368217",
  storageBucket: "uplifted-kit-368217.appspot.com",
  messagingSenderId: "954331177043",
  appId: "1:954331177043:web:d95312f73d13930976e6a6",
  measurementId: "G-SB8YYCMPE0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);



const emailInput = document.getElementById("email-login").value;
const passwordInput = document.getElementById("password-login").value;

document.getElementById("login-btn").addEventListener("click" , getvaluelogin);


function getvaluelogin(){
signInWithEmailAndPassword(emailInput, passwordInput)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    alert("success")
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert("errror")
  });
}