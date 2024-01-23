import { firestore } from "../../../firebase/firebase"
import { collection, getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';

// Define your API route handler
export default async function handler(req, res) {
    const { id } = req.query;

    try {
        // Retrieve the user document from Firestore
        const userRef = doc(firestore, 'users', id);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            res.status(200).json(userDoc.data());
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

