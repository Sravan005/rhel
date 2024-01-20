import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";


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

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const conpasswordInput = document.getElementById("confirmpassword");
const eInput = document.getElementById("email-login");
const pInput = document.getElementById("password-login");
const createacctbtn= document.getElementById("create-acct-btn");
const loginbtn = document.getElementById("login-btn");

var semail,spassword,sconpassword,lemail,lpassword;


if(createacctbtn){
createacctbtn.addEventListener("click", function() {

    var isVerified = true;
    semail = emailInput.value;
    spassword = passwordInput.value;
    sconpassword = conpasswordInput.value;

    if (spassword != sconpassword) {
      window.alert("Password fields do not match. Try again.")
      isVerified = false;
    }
     if (semail == null || spassword == null || sconpassword == null) {
      window.alert("Please fill out all required fields.");
      isVerified = false;
    }


   if (isVerified) {
      createUserWithEmailAndPassword(auth, semail, spassword)
       .then((userCredential) => {
          // Signed in 
         const user = userCredential.user;

          alert("Success! Account created.");
          redirectToAnotherPage();
          function redirectToAnotherPage() {
            window.location.href = 'login.html';
          }

       })
       .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          window.alert("Error occurred. Try again.", errorCode, errorMessage);
       });
    }
  });
}



if(loginbtn){
loginbtn.addEventListener("click", function(event) {
  event.preventDefault()
  lemail = eInput.value;
  lpassword = pInput.value;
  signInWithEmailAndPassword(auth, lemail, lpassword)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Success! Logged in.");
      redirectToAnotherPage();
   })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      window.alert("Error occurred. Try again."+ errorCode + errorMessage);
    });
  });

  function redirectToAnotherPage() {
    window.location.href = '../../public/index.html';

  }

}


