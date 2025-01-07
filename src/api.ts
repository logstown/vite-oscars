import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { Award, DbUser, Picks, Pool } from "./config/models";

export const getAwards = async (): Promise<Award[]> => {
  const q = query(collection(db, "awards"), orderBy("sequence"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Award);
};

export const getUser = async (uid: string): Promise<DbUser | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as DbUser;
  } else {
    return null;
  }
};

export const savePicks = async (uid: string, picks: Picks): Promise<void> => {
  const ref = doc(db, "users", uid);
  return updateDoc(ref, { picks });
};

export const createPool = async (uid: string, name: string): Promise<void> => {
  const newPoolRef = doc(collection(db, "pools"));

  return setDoc(newPoolRef, {
    name,
    creator: uid,
    dateCreated: serverTimestamp(),
    users: [uid],
    id: newPoolRef.id,
  });
};

export const getPool = async (id: string): Promise<Pool | null> => {
  const docRef = doc(db, "pools", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Pool;
  } else {
    return null;
  }
};

export const addUserToPool = async (uid: string, poolId: string): Promise<void> => {
  return updateDoc(doc(db, "pools", poolId), {
    users: arrayUnion(uid),
  });
};

export const deletePool = async (poolId: string): Promise<void> => {
  return deleteDoc(doc(db, "pools", poolId));
};

export const removeUserFromPool = async (uid: string, poolId: string): Promise<void> => {
  return updateDoc(doc(db, "pools", poolId), {
    users: arrayRemove(uid),
  });
};
