import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, where, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbNRWbaSQfz8_5Wb0wqr7fpI2tuiybSNs",
  authDomain: "oliom-horizons.firebaseapp.com",
  projectId: "oliom-horizons",
  storageBucket: "oliom-horizons.firebasestorage.app",
  messagingSenderId: "123365117413",
  appId: "1:123365117413:web:9c3893c2095f02305df30c",
  measurementId: "G-RMMT35LFH4"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_USERNAME = "CaelumVita";
export const DEVICE_KEY = "oh_device_id_v1";
export const DEFAULT_AVATAR = "https://res.cloudinary.com/duqlfltkd/image/upload/q_auto/f_auto/v1777208924/GreenBetter_nczggv.png";
export const AVATARS = [
  { name:"Green", color:"green", url:"https://res.cloudinary.com/duqlfltkd/image/upload/q_auto/f_auto/v1777208924/GreenBetter_nczggv.png" },
  { name:"Blue", color:"blue", url:"https://res.cloudinary.com/duqlfltkd/image/upload/q_auto/f_auto/v1777209011/BlueBetter_yifnfm.png" },
  { name:"Red", color:"red", url:"https://res.cloudinary.com/duqlfltkd/image/upload/q_auto/f_auto/v1777208950/RedBetter_dkltfq.png" },
  { name:"Orange", color:"orange", url:"https://res.cloudinary.com/duqlfltkd/image/upload/q_auto/f_auto/v1777209003/YellowBetter_yt0ops.png" }
];
export const $ = id => document.getElementById(id);
export const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const normalize = name => String(name || "").trim().toLowerCase().replace(/\s+/g,"_");
export function avatarUrl(value){return value || DEFAULT_AVATAR;}
export function avatarColorFromUrl(url){const f=AVATARS.find(a=>a.url===url);return f?f.color:"green";}
export function getDeviceId(){let id=localStorage.getItem(DEVICE_KEY);if(!id){id="dev_"+crypto.randomUUID();localStorage.setItem(DEVICE_KEY,id);}return id;}
export function authReady(){return new Promise(resolve=>{const unsub=onAuthStateChanged(auth,user=>{unsub();resolve(user);});});}
export async function getProfile(uid){const snap=await getDoc(doc(db,"users",uid));return snap.exists()?{id:uid,...snap.data()}:null;}
export async function createProfileForUser(user, username){
  const cleanName=(username||user.displayName||user.email?.split("@")[0]||"Player").trim().slice(0,24);
  const profile={uid:user.uid,username:cleanName,usernameLower:normalize(cleanName),email:user.email||"",avatar:DEFAULT_AVATAR,avatarColor:"green",bio:"",status:"active",lastDeviceId:getDeviceId(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  await setDoc(doc(db,"users",user.uid),profile,{merge:true});
  return {id:user.uid,...profile};
}
