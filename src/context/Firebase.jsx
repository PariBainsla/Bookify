import {createContext, useContext, useEffect, useState} from "react";
import { initializeApp } from "firebase/app";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged} from "firebase/auth";
import {getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where} from 'firebase/firestore';
import { getStorage,ref, uploadBytes, getDownloadURL } from "firebase/storage";

const FirebaseContext = createContext(null);


const firebaseConfig = {
    apiKey: "AIzaSyAlR2czo1Ym2bRduSIieFQIslxGHHuTaAc",
    authDomain: "bookify-b99dc.firebaseapp.com",
    projectId: "bookify-b99dc",
    storageBucket: "bookify-b99dc.appspot.com",
    messagingSenderId: "463527910729",
    appId: "1:463527910729:web:ea1cf5f1e7dd6c67b88e98"
  };

export const useFirebase = () => useContext(FirebaseContext);
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);


export const FirebaseProvider = (props) => {

const [user, setUser] = useState(null);

useEffect(()=>{
onAuthStateChanged(firebaseAuth, (user) => {
  if (user) setUser(user);
  else setUser(null);
})
},[]);

console.log(user);

const signupUserWithEmailAndPassword = (email,password) => createUserWithEmailAndPassword(firebaseAuth, email, password);
const signInUserWithEmailAndPass = (email,password) => signInWithEmailAndPassword(firebaseAuth, email, password);
const signinWithGoogle = () => signInWithPopup(firebaseAuth, googleProvider);
const handleCreateNewListing = async(name, isbn, price, cover) => {
const imageRef = ref(storage, `uploads/images/${Date.now()}-${(cover.name)}`);
const uploadResult = await uploadBytes(imageRef, cover);
return await addDoc(collection(firestore, 'books'),{
  name,
  isbn,
  price,
  imageURL:uploadResult.ref.fullPath,
  userID:user.uid,
  userEmail: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
})
};

const listAllBooks = () => {
  return getDocs(collection(firestore, "books"));
}

const getBookById = async(id) => {
  const docRef = doc(firestore, 'books', id)
  const result = await getDoc(docRef);
  return result;
}

const getImageURL = (path) => {
  return getDownloadURL(ref(storage, path));
}

const placeOrder = async(bookId, qty) => {
  const collectionRef = collection(firestore, "books", bookId, "order")
  const result = await addDoc(collectionRef,{
    userID:user.uid,
  userEmail: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  qty: Number(qty),
  })
  return result;
}

const fetchMyBooks = async(userID) => {
const collectionRef = collection(firestore, "books");
const q = query(collectionRef, where("userID", "==", userID));

const result = await getDocs(q);
return result;
}

const getOrders = async(bookId) => {
  const collectionRef = collection(firestore, 'books', bookId, 'orders');
  const result = await getDocs(collectionRef);
  return result;
}


const isLoggedIn = user? true : false;


    return <FirebaseContext.Provider value={{isLoggedIn,fetchMyBooks, placeOrder, getBookById, signinWithGoogle, signupUserWithEmailAndPassword, signInUserWithEmailAndPass, handleCreateNewListing, listAllBooks, getImageURL, user, getOrders }}>{props.children}</FirebaseContext.Provider>
}