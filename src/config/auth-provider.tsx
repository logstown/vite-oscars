import React, { useContext, useState, useEffect } from "react";
// import { GoogleAuthProvider } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";

type AuthContextType = {
  createUser?: (email: string, password: string) => Promise<UserCredential>;
  currentUser: User | null;
  loginUser?: (email: string, password: string) => Promise<UserCredential>;
  logOut?: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = React.createContext<AuthContextType>({ currentUser: null, loading: true });

// export function useAuth() {
//   return useContext(AuthContext);
// }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const createUser = (email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginUser = (email: string, password: string) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  const authValue = {
    createUser,
    currentUser,
    loginUser,
    logOut,
    loading,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}
