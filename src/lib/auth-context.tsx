"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, type Models } from "appwrite";
import type { Profile, StaffProfile } from "@/lib/types";

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  loading: boolean;
  emailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const emailVerified = user?.emailVerification ?? false;

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const jwt = await account.createJWT();
      const response = await fetch("/api/auth/me-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwt.jwt }),
      });

      if (response.ok) {
        const data = (await response.json()) as { profile: Profile | null };
        setProfile(data.profile ?? null);
        return;
      }

      // Fallback to direct lookup if endpoint fails for any reason.
      const staffRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);

      if (staffRes.documents.length > 0) {
        const staff = staffRes.documents[0] as unknown as StaffProfile;
        setProfile({
          ...staff,
          occupation: "Other",
          academicStatus: "Graduated",
          currentStatus: "Draft",
        } as Profile);
        return;
      }

      const applicantRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);

      setProfile(applicantRes.documents.length > 0 ? (applicantRes.documents[0] as unknown as Profile) : null);
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.$id);
  }, [user, fetchProfile]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      await fetchProfile(currentUser.$id);
    } catch {
      // session may have expired
      setUser(null);
      setProfile(null);
    }
  }, [fetchProfile]);

  useEffect(() => {
    async function init() {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        await fetchProfile(currentUser.$id);
      } catch {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    await account.createEmailPasswordSession(normalizedEmail, password);
    const currentUser = await account.get();
    setUser(currentUser);
    await fetchProfile(currentUser.$id);
  };

  const register = async (email: string, password: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    await account.create("unique()", normalizedEmail, password, name);
    await account.createEmailPasswordSession(normalizedEmail, password);
    const currentUser = await account.get();
    setUser(currentUser);

    // Send verification email using client SDK directly
    try {
      const verificationUrl = `${window.location.origin}/auth/verify`;
      await account.createVerification(verificationUrl);
    } catch {
      // Non-critical: user can resend later
    }
  };

  const sendVerificationEmail = async () => {
    const verificationUrl = `${window.location.origin}/auth/verify`;
    await account.createVerification(verificationUrl);
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, emailVerified, login, register, logout, refreshProfile, refreshUser, sendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
