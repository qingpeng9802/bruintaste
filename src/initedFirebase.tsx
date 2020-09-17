import * as firebase from "firebase/app";

import "firebase/analytics";
import "firebase/performance";

// from Firebase Settings -> General -> Configuration -> Firebase SDK snippet
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

export default firebase;
