import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants/storageKeys";

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  signIn: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) setUserToken(token);
      } catch (e) {
        console.log("Lỗi tải token:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const authContext = {
    userToken,
    isLoading,
    signIn: async (tokens: { accessToken: string; refreshToken: string }) => {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN,
        tokens.accessToken,
      );
      await SecureStore.setItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN,
        tokens.refreshToken,
      );
      setUserToken(tokens.accessToken);
    },
    signOut: async () => {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      setUserToken(null);
    },
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};
