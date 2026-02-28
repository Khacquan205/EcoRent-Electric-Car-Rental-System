"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCustomerProfile,
  updateCustomerProfile,
  ApiError,
} from "@/services";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getCustomerProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleUpdate = async () => {
    try {
      await updateCustomerProfile(profile);
      alert("Cập nhật thành công");
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      alert("Cập nhật thất bại");
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Cài đặt hồ sơ</h2>

      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          disabled={!editing}
          value={profile.displayName ?? ""}
          onChange={(e) =>
            setProfile({ ...profile, displayName: e.target.value })
          }
          placeholder="Tên hiển thị"
        />

        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          disabled={!editing}
          value={profile.address ?? ""}
          onChange={(e) =>
            setProfile({ ...profile, address: e.target.value })
          }
          placeholder="Địa chỉ (gợi ý xe gần bạn)"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Chỉnh sửa hồ sơ
          </button>
        ) : (
          <button
            onClick={handleUpdate}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 hover:shadow-md"
          >
            Cập nhật thông tin cá nhân
          </button>
        )}
      </div>
    </div>
  );
}