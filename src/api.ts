import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./config/firebase";

export const getAwards = async () => {
  const q = query(collection(db, "awards"), orderBy("sequence"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
};
