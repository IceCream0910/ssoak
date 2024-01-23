import firebasedb from "./firebasedb";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firestore = getFirestore(firebasedb);
const auth = getAuth(firebasedb);

export { firestore, auth };