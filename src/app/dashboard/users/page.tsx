"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { StatusBadge } from "@/components/status-badge";
import type { Profile } from "@/lib/types";
import { Users } from "lucide-react";

export default function UsersPage() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES);
        setProfiles(res.documents as unknown as Profile[]);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!profile || profile.role !== "admin") {
    return <p className="text-ink-muted">Admin access required.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">All Users</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-bold" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-page">
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Email</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Occupation</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Role</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.$id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{p.fullName}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.email}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.occupation}</td>
                  <td className="px-4 py-3 capitalize text-ink-secondary">{p.role}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.currentStatus} /></td>
                  <td className="px-4 py-3 text-ink-faint text-xs">{new Date(p.$createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <div className="p-8 text-center text-ink-muted flex flex-col items-center">
              <Users className="w-8 h-8 text-ink-faint mb-2" />
              No users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
