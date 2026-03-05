"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminUsers,
  promoteToStaff,
  type AdminUser,
  type PromoteToStaffRequest,
} from "@/services/admin-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ShieldPlus } from "lucide-react";

type PromoteForm = {
  name: string;
  phone: string;
  staffCode: string;
};

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: number) {
  if (status === 1) return "Hoạt động";
  if (status === 0) return "Không hoạt động";
  return `Trạng thái ${status}`;
}

function isPromotableUser(user: AdminUser) {
  return user.roleId !== 3 && user.roleId !== 4;
}

function buildDefaultPromoteForm(user: AdminUser): PromoteForm {
  const guessName = user.email?.split("@")[0]?.trim() ?? "";
  return {
    name: guessName,
    phone: "",
    staffCode: "",
  };
}

export default function AdminOwnersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [roleFilter, setRoleFilter] = useState<string>("tat-ca");
  const [promoteModalUser, setPromoteModalUser] = useState<AdminUser | null>(
    null,
  );
  const [promoteForm, setPromoteForm] = useState<PromoteForm>({
    name: "",
    phone: "",
    staffCode: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách người dùng.",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const roleOptions = useMemo(() => {
    const unique = new Set<string>();
    users.forEach((user) => {
      if (user.roleName && user.roleName.trim()) {
        unique.add(user.roleName.trim());
      }
    });
    return ["tat-ca", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (roleFilter === "tat-ca") return users;
    return users.filter(
      (user) =>
        (user.roleName ?? "").trim().toLowerCase() === roleFilter.toLowerCase(),
    );
  }, [roleFilter, users]);

  const openPromoteModal = (user: AdminUser) => {
    setMessage(null);
    setPromoteModalUser(user);
    setPromoteForm(buildDefaultPromoteForm(user));
  };

  const closePromoteModal = () => {
    if (submitting) return;
    setPromoteModalUser(null);
    setPromoteForm({ name: "", phone: "", staffCode: "" });
  };

  const handlePromote = async () => {
    if (!promoteModalUser) return;
    if (!promoteForm.name.trim()) {
      setMessage({
        type: "error",
        text: "Tên nhân sự là bắt buộc để thăng cấp.",
      });
      return;
    }

    const payload: PromoteToStaffRequest = {
      userId: promoteModalUser.id,
      name: promoteForm.name.trim(),
      phone: promoteForm.phone.trim() || undefined,
      staffCode: promoteForm.staffCode.trim() || undefined,
    };

    setSubmitting(true);
    setMessage(null);
    try {
      await promoteToStaff(payload);
      setMessage({
        type: "success",
        text: `Đã thăng cấp người dùng #${promoteModalUser.id} lên Nhân viên.`,
      });
      closePromoteModal();
      await fetchUsers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Thăng cấp thất bại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Chủ xe / Người dùng
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          API trả về tất cả người dùng, bạn có thể lọc theo vai trò và thăng cấp
          lên Nhân viên.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Lọc theo vai trò
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role === "tat-ca" ? "Tất cả vai trò" : role}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          className="h-9"
        >
          Làm mới
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Không có người dùng theo bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-215 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Mã người dùng
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Vai trò
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const promotable = isPromotableUser(user);
                  return (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {user.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {user.roleName ?? `Vai trò ${user.roleId}`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status === 1
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => openPromoteModal(user)}
                          disabled={!promotable}
                        >
                          <ShieldPlus className="h-4 w-4" />
                          Thăng cấp nhân viên
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={promoteModalUser !== null}
        onOpenChange={(open) => !open && closePromoteModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thăng cấp lên Nhân viên</DialogTitle>
            <DialogDescription>
              {promoteModalUser
                ? `Thăng cấp người dùng #${promoteModalUser.id} (${promoteModalUser.email}) lên Nhân viên.`
                : "Thăng cấp người dùng lên Nhân viên."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Họ và tên *
              </label>
              <Input
                value={promoteForm.name}
                onChange={(e) =>
                  setPromoteForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Tên nhân sự"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Số điện thoại
              </label>
              <Input
                value={promoteForm.phone}
                onChange={(e) =>
                  setPromoteForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Số điện thoại (tùy chọn)"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Mã nhân viên
              </label>
              <Input
                value={promoteForm.staffCode}
                onChange={(e) =>
                  setPromoteForm((prev) => ({
                    ...prev,
                    staffCode: e.target.value,
                  }))
                }
                placeholder="Mã nhân viên (tùy chọn)"
              />
            </div>
          </div>

          <DialogFooter showCloseButton={false}>
            <Button
              variant="outline"
              onClick={closePromoteModal}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handlePromote}
              disabled={submitting || !promoteForm.name.trim()}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Xác nhận thăng cấp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
