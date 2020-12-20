import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


var firebaseConfig = {
    apiKey: "AIzaSyBpOQe4C_G8WDjWqDodt88hgkALH0HIvcU",
    authDomain: "dubuddy-aaf24.firebaseapp.com",
    databaseURL: "https://dubuddy-aaf24.firebaseio.com",
    projectId: "dubuddy-aaf24",
    storageBucket: "dubuddy-aaf24.appspot.com",
    messagingSenderId: "855010307748",
    appId: "1:855010307748:web:400010d0c5aeb2ac908031",
    measurementId: "G-7VL85CHKYS"
  };
 
// var firebaseConfig = {
//   apiKey: "AIzaSyAiQzs7Txb7fCpn2Hv0LUiZd_AqKmJ1z8c",
//   authDomain: "cyber-flow.firebaseapp.com",
//   databaseURL: "https://cyber-flow.firebaseio.com",
//   projectId: "cyber-flow",
//   storageBucket: "cyber-flow.appspot.com",
//   messagingSenderId: "81193211191",
//   appId: "1:81193211191:web:2b6b79be46a6417e8a76b2",
//   measurementId: "G-H5GX5WCB4K"
// };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig); 

  export default firebase; 