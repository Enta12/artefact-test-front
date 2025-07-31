"use client";

import { User } from "@/app/types/auth";
import React, { createContext, useState, ReactNode } from "react";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, initialUser }: { children: ReactNode, initialUser: User | null }) => {
  const [user, setUser] = useState<User | null>(initialUser);


  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};