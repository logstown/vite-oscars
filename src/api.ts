import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config/firebase'
import { Award, DbUser, Picks, Pool } from './config/models'

export const listenToAwards = (cb: (awards: Award[]) => void) => {
  const q = query(collection(db, 'awards'), orderBy('sequence'))

  return onSnapshot(q, querySnapshot => {
    const awards: Award[] = []
    querySnapshot.forEach(x => awards.push(x.data() as Award))

    cb(awards)
  })
}

export const getUser = async (uid: string): Promise<DbUser | null> => {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as DbUser
  } else {
    return null
  }
}

export const getPools = async (uid: string): Promise<Pool[]> => {
  const q = query(
    collection(db, 'pools'),
    where('users', 'array-contains', uid),
  )
  const querySnapshot = await getDocs(q)

  const pools: Pool[] = []
  querySnapshot.forEach(x => pools.push(x.data() as Pool))

  return pools
}

export const savePicks = async (uid: string, picks: Picks): Promise<void> => {
  const ref = doc(db, 'users', uid)
  return updateDoc(ref, { picks })
}

export const createPool = async (uid: string, name: string): Promise<void> => {
  const newPoolRef = doc(collection(db, 'pools'))

  return setDoc(newPoolRef, {
    name,
    creator: uid,
    dateCreated: serverTimestamp(),
    users: [uid],
    id: newPoolRef.id,
  })
}

export const getPool = async (id: string): Promise<Pool | null> => {
  const docRef = doc(db, 'pools', id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as Pool
  } else {
    return null
  }
}

export const addUserToPool = async (
  uid: string,
  poolId: string,
): Promise<void> => {
  return updateDoc(doc(db, 'pools', poolId), {
    users: arrayUnion(uid),
  })
}

export const deletePool = async (poolId: string): Promise<void> => {
  return deleteDoc(doc(db, 'pools', poolId))
}

export const removeUserFromPool = async (
  uid: string,
  poolId: string,
): Promise<void> => {
  return updateDoc(doc(db, 'pools', poolId), {
    users: arrayRemove(uid),
  })
}
