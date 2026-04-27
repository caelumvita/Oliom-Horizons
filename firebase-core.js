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
export async function ensureProfile(user){if(!user)return null;const existing=await getProfile(user.uid);if(existing)return existing;return createProfileForUser(user,user.displayName||user.email?.split("@")[0]||"Player");}
export async function updateProfileData(uid,data){await updateDoc(doc(db,"users",uid),{...data,updatedAt:serverTimestamp()});}
export async function touchUserDevice(user){if(!user)return;await setDoc(doc(db,"users",user.uid),{lastDeviceId:getDeviceId(),lastSeenAt:serverTimestamp()},{merge:true});}
export async function getDeviceBan(){const snap=await getDoc(doc(db,"deviceBans",getDeviceId()));return snap.exists()?{id:getDeviceId(),...snap.data()}:null;}
export function showBlockedScreen(title,message){document.body.innerHTML=`<main style="max-width:720px;margin:60px auto;padding:18px;font-family:Inter,system-ui,sans-serif;color:#172819;"><section style="border:1px solid #d6efcf;border-radius:18px;padding:18px;background:#fff;"><h1 style="margin-top:0;color:#3f922e;">${escapeHtml(title)}</h1><p style="line-height:1.6;color:#667868;">${escapeHtml(message)}</p><a href="server.html" style="display:inline-flex;padding:9px 14px;border-radius:999px;background:#7ed957;color:#173019;text-decoration:none;font-weight:700;">Back to Games</a></section></main>`;}
export async function checkDeviceBanOrBlock(){try{const ban=await getDeviceBan();if(ban?.active!==false){showBlockedScreen("This device is banned",ban?.reason||"Account creation and access are blocked on this device.");return true;}}catch(err){console.warn("Device ban check failed:",err);}return false;}
export async function checkAccountStatusOrBlock(user){if(!user)return false;const p=await ensureProfile(user);if(p?.status==="account_deleted"||p?.status==="banned"){await signOut(auth);showBlockedScreen("Account removed",p?.banMessage||p?.banReason||"This account was removed by moderation.");return true;}return false;}
export async function renderHeaderAuth(){
  const authBox=document.querySelector("[data-auth]"); if(!authBox)return;
  const blocked=await checkDeviceBanOrBlock(); if(blocked)return;
  const user=await authReady();
  if(!user){authBox.innerHTML=`<a class="btn" href="login.html">Log in</a><a class="btn primary" href="signin.html">Sign up</a>`;return;}
  if(await checkAccountStatusOrBlock(user))return;
  await touchUserDevice(user);
  const profile=await ensureProfile(user);
  authBox.innerHTML=`<a class="btn primary" href="studio.html">Studio</a><span class="tiny">Signed in as ${escapeHtml(profile?.username||user.email)}</span><button class="btn danger" id="logoutBtn">Log out</button>`;
  document.getElementById("logoutBtn")?.addEventListener("click",async()=>{await signOut(auth);location.href="server.html";});
}
export {onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,doc,getDoc,setDoc,updateDoc,collection,addDoc,getDocs,query,orderBy,where,limit,serverTimestamp};
