"use client";
import { Activity, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAdmin } from "@/contexts/AdminContext";
import {
  ActivityIcon,
  ActivitySquare,
  HandHeart,
  MapPin,
  PieChartIcon,
  Siren,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const MarkerClusterGroup = dynamic(() => import("react-leaflet-cluster"), {
  ssr: false,
});

export default function AdminDashboard() {
  const { sos, stats, loading, fetchAdmin } = useAdmin();
  const [filter, setFilter] = useState("all");
  const [leaflet, setLeaflet] = useState(null);
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

  useEffect(() => {
    import("leaflet").then((L) => {
      setLeaflet(L);

      // Fix icon paths here (client only)
      delete L.Icon.Default.prototype._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconUrl: "/marker-icon.png",
        iconRetinaUrl: "/marker-icon-2x.png",
        shadowUrl: "/marker-shadow.png",
      });
    });
  }, []);
  // useEffect(() => {
  //   const interval = setInterval(fetchAdmin, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const filteredSOS = useMemo(
    () => sos.filter((s) => (filter === "all" ? true : s.status === filter)),
    [sos, filter],
  );
  const getColor = (status) => {
    if (status === "active") return "red";
    if (status === "accepted") return "orange";
    if (status === "resolved") return "green";
    return "red";
  };
  const createIcon = (color) => {
    if (!leaflet) return null;

    return new leaflet.Icon({
      iconUrl: `/marker-icon-${color}.png`,
      shadowUrl: "/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };
  // ===== Analytics (derived from sos) =====
  const analytics = useMemo(() => {
    const total = sos.length;
    const active = sos.filter(
      (s) => s.status === "active" || s.status === "escalated",
    ).length;
    const accepted = sos.filter((s) => s.status === "accepted").length;
    const resolved = sos.filter((s) => s.status === "resolved").length;

    // last 7 days line data
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        key,
        label: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      };
    });

    const line = days.map((d) => {
      const created = sos.filter(
        (s) => new Date(s.createdAt).toISOString().slice(0, 10) === d.key,
      ).length;
      const resolvedCount = sos.filter(
        (s) =>
          s.resolvedAt &&
          new Date(s.resolvedAt).toISOString().slice(0, 10) === d.key,
      ).length;
      return { name: d.label, created, resolved: resolvedCount };
    });

    //STEP 1: extract response times
    const times = sos
      .filter((s) => s.acceptedAt)
      .map((s) =>
        Math.max(
          1,
          Math.round((new Date(s.acceptedAt) - new Date(s.createdAt)) / 60000),
        ),
      );
    // average response time (created → accepted)
    const avgResponseTime =
      times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0;

    //resolved times (created → resolved)
    const resolvedTimes = sos
      .filter((s) => s.resolvedAt)
      .map((s) =>
        Math.max(
          1,
          Math.round((new Date(s.resolvedAt) - new Date(s.createdAt)) / 60000),
        ),
      )
      .sort((a, b) => a - b); // IMPORTANT for median

    // median resolve time
    let medianResolvedTime = 0;

    if (resolvedTimes.length > 0) {
      const mid = Math.floor(resolvedTimes.length / 2);

      medianResolvedTime =
        resolvedTimes.length % 2 !== 0
          ? resolvedTimes[mid] // odd
          : Math.round((resolvedTimes[mid - 1] + resolvedTimes[mid]) / 2); // even
    }

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const buckets = [
      { range: "0-2 min", count: 0 },
      { range: "2-5 min", count: 0 },
      { range: "5-15 min", count: 0 },
      { range: "15-30 min", count: 0 },
      { range: "30+ min", count: 0 },
    ];

    times.forEach((t) => {
      if (t <= 2) buckets[0].count++;
      else if (t <= 5) buckets[1].count++;
      else if (t <= 15) buckets[2].count++;
      else if (t <= 30) buckets[3].count++;
      else buckets[4].count++;
    });

    // pie: status distribution
    const pie = [
      { name: "Active", value: active },
      { name: "Accepted", value: accepted },
      { name: "Resolved", value: resolved },
    ];

    return {
      total,
      active,
      accepted,
      resolved,
      line,
      buckets,
      pie,
      avgResponseTime,
      medianResolvedTime,
      resolutionRate,
    };
  }, [sos]);

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];
  const mapCenter = sos.length
    ? [
        sos.reduce((sum, s) => sum + (s.location?.coordinates?.[1] || 0), 0) /
          sos.length,
        sos.reduce((sum, s) => sum + (s.location?.coordinates?.[0] || 0), 0) /
          sos.length,
      ]
    : [20.5937, 78.9629]; // default to India center

  if (loading) {
    return <div className="p-10 min-h-screen">Loading dashboard...</div>;
  }
  return (
    <div className="mt-6 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ===== TOP STATS ===== */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} />
        <StatCard title="Total SOS" value={stats?.totalSOS || 0} />
        <StatCard title="Active SOS" value={stats?.activeSOS || 0} />
        <StatCard title="Volunteers" value={stats?.volunteers || 0} />
        <StatCard
          title="Avg Response"
          value={`${analytics.avgResponseTime} min`}
        />
        <StatCard
          title="Median Resolve"
          value={`${analytics.medianResolvedTime} min`}
        />
        <StatCard
          title="Resolution Rate"
          value={`${analytics.resolutionRate}%`}
        />
      </div>

      {/* ===== CHARTS ===== */} 
      <div className="lg:col-span-2 bg-white shadow rounded-xl p-4 min-w-0">
        <h2
          className="text-lg font-bold mb-4 flex items-center gap-2 [box-shadow:inset_6px_0_10px_-6px_rgba(59,130,246,0.7)] pr-4
border-l-4 border-blue-500 pl-3 bg-gradient-to-r w-fit from-blue-600 to-indigo-950 text-transparent bg-clip-text"
        >
          <TrendingUp className="text-blue-500" size={20} />
          SOS Activity (Last 7 Days)
        </h2>
        <div className="h-[200px] sm:h-[260px] md:h-[300px] w-full min-w-0">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
            <LineChart data={analytics.line}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="hidden sm:block"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-4 min-w-0">
        <h2
          className="text-lg font-bold mb-4 flex items-center gap-2 [box-shadow:inset_6px_0_10px_-6px_rgba(234,179,8,0.7)] pr-4
border-l-4 border-yellow-500 pl-3 w-fit bg-gradient-to-r from-yellow-600 to-orange-600 text-transparent bg-clip-text"
        >
          <PieChartIcon className="text-yellow-500" size={20} />
          SOS Status Overview
        </h2>
        <div className="h-[260px] min-h-[200px] w-full min-w-0">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
            <PieChart>
              <Pie
                data={analytics.pie}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {analytics.pie.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="lg:col-span-3 bg-white shadow rounded-xl p-4 min-w-0">
        <h2
          className="text-lg font-bold mb-4 flex items-center gap-2 [box-shadow:inset_6px_0_10px_-6px_rgba(249,115,22,0.7)] pr-4
border-l-4 border-orange-500 pl-3 bg-gradient-to-r w-fit from-orange-600 to-orange-950 text-transparent bg-clip-text"
        >
          <Timer className="text-orange-500" size={20} />
          Response Time Distribution
        </h2>

        <div className="h-[260px] min-h-[200px] w-full min-w-0">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
            {analytics.buckets.length <= 1 ? (
              <p className="text-gray-500 text-center mt-10">
                Not enough data to show response analytics
              </p>
            ) : (
              <BarChart data={analytics.buckets} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-20}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                  }}
                  formatter={(value) => `${value}`}
                />
                <Bar dataKey="count">
                  {analytics.buckets.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === 0
                          ? "#10b981"
                          : index === 1
                            ? "#22c55e"
                            : index === 2
                              ? "#f59e0b"
                              : index === 3
                                ? "#fb923c"
                                : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* LIVE MAP */}
      <h2
        className="text-lg font-bold mb-4 flex items-center gap-2 [box-shadow:inset_6px_0_10px_-6px_rgba(239,68,68,0.7)] pr-4
border-l-4 border-red-500 pl-3 bg-gradient-to-r from-red-600 via-green-800 to-indigo-600 w-fit text-transparent bg-clip-text"
      >
        <MapPin className="text-red-500" size={20} />
        Live SOS Tracking & Incident Map
      </h2>
      <div className="lg:col-span-3 h-[400px] rounded-xl overflow-hidden min-h-0">
        {sos.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No SOS data available
          </p>
        ) : (
          <MapContainer center={mapCenter} zoom={5} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MarkerClusterGroup chunkedLoading>
              {sos
                .filter((s) => s.location?.coordinates)
                .map((s) => {
                  const lat = s.location?.coordinates?.[1];
                  const lng = s.location?.coordinates?.[0];

                  if (!lat || !lng) return null;

                  return (
                    <Marker
                      key={s._id}
                      position={[lat, lng]}
                      icon={createIcon(getColor(s.status))}
                    >
                      <Popup>
                        <div>
                          <p className="font-bold">
                            {s.userId?.name || "Unknown"}
                          </p>
                          <p>Status: {s.status}</p>
                          <p>Volunteers: {s.acceptedBy?.length || 0}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  const config = {
    "Total Users": {
      icon: Users,
      color: "blue",
      bg: "bg-blue-50",
      border: "border-blue-500",
      shadow: "rgba(59,130,246,0.5)",
    },
    "Total SOS": {
      icon: Siren,
      color: "purple",
      bg: "bg-purple-50",
      border: "border-purple-500",
      shadow: "rgba(168,85,247,0.5)",
    },
    "Active SOS": {
      icon: ActivityIcon,
      color: "red",
      bg: "bg-red-50",
      border: "border-red-500",
      shadow: "rgba(239,68,68,0.5)",
    },
    Volunteers: {
      icon: HandHeart,
      color: "green",
      bg: "bg-green-50",
      border: "border-green-500",
      shadow: "rgba(34,197,94,0.5)",
    },
    "Avg Response": {
      icon: Timer,
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      shadow: "rgba(234,179,8,0.5)",
    },
    "Median Resolve": {
      icon: ActivitySquare,
      bg: "bg-indigo-50",
      border: "border-indigo-500",
      shadow: "rgba(99,102,241,0.5)",
    },
    "Resolution Rate": {
      icon: TrendingUp,
      bg: "bg-emerald-50",
      border: "border-emerald-500",
      shadow: "rgba(16,185,129,0.5)",
    },
  };

  const item = config[title] || {};
  const Icon = item.icon || Users;

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 border-l-4 ${item.border} ${item.bg}
      transition-all duration-300 hover:scale-[1.03] hover:shadow-lg`}
      style={{
        boxShadow: `inset 6px 0 12px -6px ${item.shadow}`,
      }}
    >
      {/* Icon */}
      <div className="absolute top-3 right-3 opacity-20">
        <Icon size={40} />
      </div>

      {/* Title */}
      <p className="text-sm text-gray-600 font-medium">{title}</p>

      {/* Value */}
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
