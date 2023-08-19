import firebasedb from "./firebasedb";
import { getDatabase, ref, set, onValue, push, remove, getFirestore } from "firebase/firestore";

const firestore = getFirestore(firebasedb);
export default firestore;