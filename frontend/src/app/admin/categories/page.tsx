"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  type AdminCategory,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from "@/services/admin-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Không thể tải danh mục",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingId(null);
    setFormName("");
    setFormDescription("");
    setFormStatus(1);
    setModalOpen(true);
  };

  const openEdit = (c: AdminCategory) => {
    setEditingId(c.id);
    setFormName(c.name);
    setFormDescription(c.description ?? "");
    setFormStatus(c.status);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      setMessage({ type: "error", text: "Tên danh mục là bắt buộc." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      if (editingId !== null) {
        const body: UpdateCategoryRequest = {
          name: formName.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
        };
        await updateAdminCategory(editingId, body);
        setMessage({ type: "success", text: "Đã cập nhật danh mục." });
      } else {
        const body: CreateCategoryRequest = {
          name: formName.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
        };
        await createAdminCategory(body);
        setMessage({ type: "success", text: "Đã tạo danh mục mới." });
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Thao tác thất bại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    setMessage(null);
    try {
      await deleteAdminCategory(id);
      setMessage({ type: "success", text: "Đã xóa danh mục." });
      setDeleteId(null);
      await fetchCategories();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Xóa thất bại.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Danh mục</h1>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý loại xe (danh mục) hiển thị khi đăng tin và tìm kiếm.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm danh mục
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
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Chưa có danh mục. Bấm &quot;Thêm danh mục&quot; để tạo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Tên
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Mô tả
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {c.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                      {c.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          c.status === 1
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status === 1 ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-slate-600"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleteId(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
            <DialogDescription>
              Tên danh mục hiển thị cho chủ xe khi đăng tin và cho khách khi tìm
              kiếm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Tên *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Sedan, SUV điện"
                className="border-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Mô tả ngắn (tùy chọn)"
                className="min-h-[80px] border-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Trạng thái
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
          </div>
          <DialogFooter showCloseButton={false}>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formName.trim()}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId !== null ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm: inline confirm via browser confirm; optional modal for deleteId */}
      {deleteId !== null && (
        <Dialog open={true} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Xóa danh mục?</DialogTitle>
              <DialogDescription>
                Hành động này không thể hoàn tác. Các bài đăng đang dùng danh
                mục này có thể bị ảnh hưởng.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton={false}>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteId)}
              >
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
