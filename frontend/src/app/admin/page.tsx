"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Package, FileText, Users, TrendingUp } from "lucide-react";
import {
  getAdminStats,
  getAdminMonthly,
  getAdminPackageDistribution,
  getAdminPostStatus,
} from "@/services/admin-dashboard";

/* ── Types ─────────────────────────────────────────────────────── */

interface SummaryStatItem {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

/* ── Custom tooltip ───────────────────────────────────────────── */

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function AdminHomePage() {
  const [stats, setStats] = useState<SummaryStatItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<
    Array<{ month: string; packages: number; posts: number }>
  >([]);
  const [packageDistribution, setPackageDistribution] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [postStatusData, setPostStatusData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsRes, monthlyRes, packageDistRes, postStatusRes] =
        await Promise.all([
          getAdminStats(),
          getAdminMonthly(6),
          getAdminPackageDistribution(),
          getAdminPostStatus(),
        ]);

      // Transform stats
      if (statsRes) {
        const statData: SummaryStatItem[] = [
          {
            label: "Tổng gói đã bán",
            value: statsRes.totalPackagesSold?.toString() || "0",
            change: "+0%",
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Tổng bài đăng",
            value: statsRes.totalPosts?.toString() || "0",
            change: "+0%",
            icon: FileText,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Chủ xe hoạt động",
            value: statsRes.activeOwnersCount?.toString() || "0",
            change: "+0%",
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Doanh thu tháng",
            value:
              (statsRes.monthlyRevenue?.toLocaleString("vi-VN") || "0") + " đ",
            change: "+0%",
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ];
        setStats(statData);
      }

      // Transform monthly data
      if (monthlyRes && Array.isArray(monthlyRes)) {
        const monthlyChartData = monthlyRes.map((item) => ({
          month: item.month || "",
          packages: item.packagesSold || 0,
          posts: item.postsCount || 0,
        }));
        setMonthlyData(monthlyChartData);
      }

      // Transform package distribution
      if (packageDistRes && Array.isArray(packageDistRes)) {
        const colors = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"];
        const packageData = packageDistRes.map((item, index) => ({
          name: item.packageName || "Unknown",
          value: item.count || 0,
          color: colors[index % colors.length],
        }));
        setPackageDistribution(packageData);
      }

      // Transform post status data
      if (postStatusRes && Array.isArray(postStatusRes)) {
        const statusColorMap: Record<string, string> = {
          "Đã duyệt": "#10B981",
          "Chờ duyệt": "#F59E0B",
          "Từ chối": "#EF4444",
          "Hết hạn": "#6B7280",
        };
        const postStatusChartData = postStatusRes.map((item) => ({
          name: item.statusName || "Unknown",
          value: item.count || 0,
          color: statusColorMap[item.statusName || ""] || "#6B7280",
        }));
        setPostStatusData(postStatusChartData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Bảng điều khiển</h1>
      <p className="mt-2 text-sm text-gray-600">
        Chọn mục ở thanh bên để quản lý.
      </p>

      {/* ── Summary stat cards ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border bg-white p-5"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs font-medium text-emerald-600">
                {stat.change} so với tháng trước
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1: Bar + Line ── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Bar chart — packages vs posts per month */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Gói owner mua & Bài đăng theo tháng
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">6 tháng gần nhất</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="packages"
                  name="Gói đã mua"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="posts"
                  name="Bài đăng"
                  fill="#8B5CF6"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line chart — trend over time */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Xu hướng tăng trưởng
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Gói owner & bài đăng theo tháng
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="packages"
                  name="Gói đã mua"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#3B82F6" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="posts"
                  name="Bài đăng"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#8B5CF6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Charts row 2: Pie charts ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Pie — package distribution */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Phân bố gói đã mua
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">Theo loại gói</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {packageDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {packageDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie — post status distribution */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Trạng thái bài đăng
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Phân bố theo trạng thái
          </p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={postStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {postStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {postStatusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
