"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Package, Trash2, Edit2, Plus } from "lucide-react";
import {
  getAdminAdPackages,
  createAdPackage,
  updateAdPackage,
  deleteAdPackage,
  type AdPackage,
  type CreateAdPackageRequest,
  type UpdateAdPackageRequest,
} from "@/services/admin-ad-packages";
import { Button } from "@/components/ui/button";

function formatPrice(value?: number) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function statusLabel(status: number) {
  if (status === 1) return "Hoạt động";
  if (status === 0) return "Hết hạn";
  return `Trạng thái ${status}`;
}

function priorityLabel(level: number) {
  if (level === 1) return "Thấp";
  if (level === 2) return "Trung bình";
  if (level === 3) return "Cao";
  return `Mức ${level}`;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status?: number;
}

export default function AdminAdPackagesPage() {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    durationDays: 0,
    maxPosts: 0,
    priorityLevel: 1,
    status: 1,
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await getAdminAdPackages();
      setPackages(data);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách gói quảng cáo.",
      });
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleFormChange = (
    field: keyof FormData,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      durationDays: 0,
      maxPosts: 0,
      priorityLevel: 1,
      status: 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        // Update
        const updateRequest: UpdateAdPackageRequest = {
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price,
          durationDays: formData.durationDays,
          maxPosts: formData.maxPosts,
          priorityLevel: formData.priorityLevel,
          status: formData.status || 1,
        };
        await updateAdPackage(editingId, updateRequest);
        setMessage({
          type: "success",
          text: "Cập nhật gói quảng cáo thành công!",
        });
      } else {
        // Create
        const createRequest: CreateAdPackageRequest = {
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price,
          durationDays: formData.durationDays,
          maxPosts: formData.maxPosts,
          priorityLevel: formData.priorityLevel,
        };
        await createAdPackage(createRequest);
        setMessage({
          type: "success",
          text: "Tạo gói quảng cáo thành công!",
        });
      }
      resetForm();
      await fetchPackages();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu gói.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (pkg: AdPackage) => {
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price,
      durationDays: pkg.durationDays,
      maxPosts: pkg.maxPosts,
      priorityLevel: pkg.priorityLevel,
      status: pkg.status,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa gói này?")) return;

    try {
      await deleteAdPackage(id);
      setMessage({
        type: "success",
        text: "Xóa gói quảng cáo thành công!",
      });
      await fetchPackages();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa gói.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Quản lý gói quảng cáo
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tạo, chỉnh sửa và quản lý các gói quảng cáo cho chủ xe.
        </p>
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

      <div className="flex justify-between gap-2">
        <Button onClick={fetchPackages} variant="outline" size="sm">
          Làm mới
        </Button>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tạo gói mới
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? "Chỉnh sửa gói" : "Tạo gói mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tên gói
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Nhập tên gói"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    handleFormChange("price", parseFloat(e.target.value))
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Thời hạn (ngày)
                </label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) =>
                    handleFormChange("durationDays", parseInt(e.target.value))
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Số bài tối đa
                </label>
                <input
                  type="number"
                  value={formData.maxPosts}
                  onChange={(e) =>
                    handleFormChange("maxPosts", parseInt(e.target.value))
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="priority-level"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Mức độ ưu tiên
                </label>
                <select
                  id="priority-level"
                  value={formData.priorityLevel}
                  onChange={(e) =>
                    handleFormChange("priorityLevel", parseInt(e.target.value))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                >
                  <option value="1">Thấp</option>
                  <option value="2">Trung bình</option>
                  <option value="3">Cao</option>
                </select>
              </div>
              {editingId && (
                <div>
                  <label
                    htmlFor="status"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    value={formData.status || 1}
                    onChange={(e) =>
                      handleFormChange("status", parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option value="1">Hoạt động</option>
                    <option value="0">Hết hạn</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Nhập mô tả gói"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={formLoading} size="sm">
                {formLoading ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                size="sm"
                disabled={formLoading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              Chưa có gói quảng cáo nào
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Các gói quảng cáo sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Tên gói
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Giá
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Thời hạn
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Bài tối đa
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Ưu tiên
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {pkg.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {pkg.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatPrice(pkg.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {pkg.durationDays} ngày
                    </td>
                    <td className="px-4 py-3 text-slate-700">{pkg.maxPosts}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {priorityLabel(pkg.priorityLevel)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          pkg.status === 1
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabel(pkg.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(pkg)}
                          title="Chỉnh sửa"
                          className="inline-flex items-center rounded px-2 py-1 text-xs text-sky-600 hover:bg-sky-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          title="Xóa"
                          className="inline-flex items-center rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
