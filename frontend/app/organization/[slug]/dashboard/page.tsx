"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { useSnippets } from "@/hooks/snippets/useSnippets";
import { useGetMembers } from "@/hooks/teams/useGetMembers";
import { useGetConversations } from "@/hooks/teams/useGetConversations";
import { useGetUserGroups } from "@/hooks/teams/useGetUserGroups";
import { useProfile } from "@/hooks/auth/useProfile";
import { useRemoveMember } from "@/hooks/organization/useRemoveMember";
import { Snippet } from "@/types/snippets";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  Code2,
  Users,
  MessageCircle,
  Layers,
  ArrowUpRight,
  FileCode2,
  Activity,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Clock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 30)
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function formatLang(lang: string | null) {
  if (!lang) return "Unknown";
  const map: Record<string, string> = {
    JAVASCRIPT: "JavaScript",
    TYPESCRIPT: "TypeScript",
    PYTHON: "Python",
    RUST: "Rust",
    GO: "Go",
    HTML: "HTML",
    CSS: "CSS",
    SQL: "SQL",
    BASH: "Bash",
    CSHARP: "C#",
    CPP: "C++",
    KOTLIN: "Kotlin",
    SWIFT: "Swift",
    JAVA: "Java",
    GRAPHQL: "GraphQL",
    DOCKERFILE: "Dockerfile",
  };
  return (
    map[lang.toUpperCase()] ??
    lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
  );
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#facc15",
  TypeScript: "#60a5fa",
  Python: "#4ade80",
  Rust: "#fb923c",
  Go: "#22d3ee",
  HTML: "#f87171",
  CSS: "#a78bfa",
  SQL: "#2dd4bf",
  Bash: "#a3a3a3",
  "C#": "#818cf8",
  "C++": "#f472b6",
  Java: "#fb923c",
  Kotlin: "#a78bfa",
  Swift: "#f97316",
  GraphQL: "#e879f9",
  Dockerfile: "#38bdf8",
};
const PIE_FALLBACK = [
  "#2dd4bf",
  "#60a5fa",
  "#facc15",
  "#f87171",
  "#a78bfa",
  "#4ade80",
  "#fb923c",
  "#22d3ee",
  "#e879f9",
  "#818cf8",
];

/* ── build last-N-days activity from snippet created_at ── */
function buildActivityData(snippets: Snippet[], days = 14) {
  const counts: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const s of snippets) {
    const key = new Date(s.created_at).toISOString().slice(0, 10);
    if (key in counts) counts[key]++;
  }
  return Object.entries(counts).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    snippets: count,
  }));
}

/* ── language distribution for pie ── */
function buildLangData(snippets: Snippet[]) {
  const map: Record<string, number> = {};
  for (const s of snippets) {
    const l = formatLang(s.language);
    map[l] = (map[l] ?? 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
}

/* ── snippets per author for bar ── */
function buildAuthorData(snippets: Snippet[]) {
  const map: Record<string, number> = {};
  for (const s of snippets) {
    const name = s.author?.name ?? "Unknown";
    map[name] = (map[name] ?? 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.split(" ")[0], count }));
}

/* ══════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════ */

/* Stat card */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  href?: string;
}) {
  const inner = (
    <div
      className="relative flex flex-col justify-between p-5 rounded-2xl border overflow-hidden group transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: "#0a0a0f",
        borderColor: "rgba(20,184,166,0.12)",
        boxShadow: "0 0 0 0 transparent",
      }}
    >
      {/* glow blob */}
      <div
        className="absolute -top-6 -right-6 size-24 rounded-full pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity"
        style={{
          background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center size-10 rounded-xl"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon
            className="size-5"
            style={{ color: accent }}
            strokeWidth={1.8}
          />
        </div>
        {href && (
          <ArrowUpRight
            className="size-4 text-zinc-700 group-hover:text-zinc-400 transition-colors"
            strokeWidth={2}
          />
        )}
      </div>

      <div>
        <p className="text-[28px] font-bold text-white leading-none tabular-nums">
          {value}
        </p>
        <p className="text-[12px] font-medium text-zinc-500 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-zinc-700 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

/* Section heading */
function SectionHeading({
  icon: Icon,
  title,
  action,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-teal-500" strokeWidth={2} />
        <h2 className="text-[13px] font-bold text-zinc-200 tracking-wide">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* Chart card wrapper */
function ChartCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ background: "#0a0a0f", borderColor: "rgba(20,184,166,0.12)" }}
    >
      {children}
    </div>
  );
}

/* Custom tooltip for area / bar */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-[11px] font-semibold"
      style={{
        background: "#111118",
        border: "1px solid rgba(20,184,166,0.25)",
        color: "#5eead4",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      <p className="text-zinc-500 font-normal mb-0.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey}>
          {p.value} {p.dataKey}
        </p>
      ))}
    </div>
  );
}

/* Skeleton block */
function Skel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: "rgba(255,255,255,0.05)" }}
    />
  );
}

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */

export default function Dashboard() {
  const { slug } = useParams();
  const router = useRouter();

  const { data: profile } = useProfile();
  const { data: org, isPending: orgLoading } = useOrganization(slug as string);
  const orgId = org?.id ? Number(org.id) : undefined;

  const { data: snippetData, isPending: snippetsLoading } = useSnippets({
    organizationId: Number(orgId) ?? 0,
    page: 1,
    search: "",
  });

  /* fetch up to 100 for full chart data */
  const { data: allSnippetData } = useSnippets({
    organizationId: Number(orgId) ?? 0,
    page: 1,
    search: "",
  });

  const { data: membersData, isPending: membersLoading } = useGetMembers(orgId);
  const { data: conversationsData } = useGetConversations(orgId);
  const { data: groupsData } = useGetUserGroups(orgId);
  const { mutate: removeMember, isPending: removingMember } = useRemoveMember();
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);

  const snippets = snippetData?.data ?? [];
  const allSnippets = allSnippetData?.data ?? [];
  const totalSnippets = snippetData?.total ?? 0;
  const members = membersData?.data ?? [];
  const conversations = conversationsData?.data ?? [];
  const groups = groupsData?.data ?? [];
  const myMemberRecord = members.find((m) => m.userId === Number(profile?.id));
  const canManageMembers = myMemberRecord?.role === "OWNER";

  /* derived chart data */
  const activityData = useMemo(
    () => buildActivityData(allSnippets, 14),
    [allSnippets],
  );
  const langData = useMemo(() => buildLangData(allSnippets), [allSnippets]);
  const authorData = useMemo(() => buildAuthorData(allSnippets), [allSnippets]);

  /* recent snippets (latest 5) */
  const recentSnippets = useMemo(
    () =>
      [...snippets]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [snippets],
  );

  /* most used language */
  const topLang = langData[0]?.name ?? "—";

  const isLoading =
    orgLoading || snippetsLoading || (!!orgId && membersLoading);

  /* greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.name?.split(" ")[0] ?? "there";

  const handleRemoveMember = (memberId: number, memberName: string) => {
    if (!orgId) return;

    const ok = window.confirm(`Remove ${memberName} from this organization?`);
    if (!ok) return;

    setRemovingMemberId(memberId);
    removeMember(
      { organizationId: Number(orgId), memberId },
      {
        onSuccess: () => {
          toast.success(`${memberName} removed from organization`);
          setRemovingMemberId(null);
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to remove member",
          );
          setRemovingMemberId(null);
        },
      },
    );
  };

  return (
    <div
      className="flex flex-col gap-6 pb-8 font-mono"
      style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
    >
      {/* ── Hero greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-3.5 text-teal-400" strokeWidth={2} />
            <span className="text-teal-500 text-[10px] tracking-widest uppercase font-semibold">
              {org?.name ?? "Dashboard"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {greeting},{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#2dd4bf,#60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {firstName}
            </span>{" "}
            👋
          </h1>
          <p className="text-zinc-600 text-[12px] mt-0.5">
            Here's what's happening in your vault today.
          </p>
        </div>

        {/* quick nav */}
        <div className="flex gap-2">
          <Link
            href={`/organization/${slug}/dashboard/snippets`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-teal-300 border transition-all hover:scale-[1.03]"
            style={{
              background: "rgba(20,184,166,0.08)",
              borderColor: "rgba(20,184,166,0.2)",
            }}
          >
            <Code2 className="size-3.5" strokeWidth={2} />
            Snippets
          </Link>
          <Link
            href={`/organization/${slug}/dashboard/teams`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-blue-300 border transition-all hover:scale-[1.03]"
            style={{
              background: "rgba(59,130,246,0.08)",
              borderColor: "rgba(59,130,246,0.2)",
            }}
          >
            <MessageCircle className="size-3.5" strokeWidth={2} />
            Teams
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skel key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Code2}
            label="Total Snippets"
            value={totalSnippets}
            sub={`Top: ${topLang}`}
            accent="#2dd4bf"
            href={`/organization/${slug}/dashboard/snippets`}
          />
          <StatCard
            icon={Users}
            label="Team Members"
            value={members.length}
            sub="Active collaborators"
            accent="#60a5fa"
          />
          <StatCard
            icon={MessageCircle}
            label="Conversations"
            value={conversations.length}
            sub={`${groups.length} group${groups.length !== 1 ? "s" : ""}`}
            accent="#a78bfa"
            href={`/organization/${slug}/dashboard/teams`}
          />
          <StatCard
            icon={Layers}
            label="Groups"
            value={groups.length}
            sub="Team channels"
            accent="#fb923c"
            href={`/organization/${slug}/dashboard/teams`}
          />
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity area chart — 2/3 width */}
        <ChartCard className="lg:col-span-2">
          <SectionHeading
            icon={Activity}
            title="Snippet Activity"
            action={
              <span className="text-[10px] text-zinc-700 uppercase tracking-widest">
                Last 14 days
              </span>
            }
          />
          {isLoading ? (
            <Skel className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart
                data={activityData}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#52525b", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#52525b", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "rgba(45,212,191,0.15)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="snippets"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#2dd4bf",
                    stroke: "#0a0a0f",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Language pie chart — 1/3 width */}
        <ChartCard>
          <SectionHeading icon={FileCode2} title="Languages" />
          {isLoading ? (
            <Skel className="h-52 w-full" />
          ) : langData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-zinc-700 text-[12px]">
              No data yet
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={langData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {langData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={
                          LANG_COLORS[entry.name] ??
                          PIE_FALLBACK[i % PIE_FALLBACK.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                          style={{
                            background: "#111118",
                            border: "1px solid rgba(20,184,166,0.25)",
                            color: "#e4e4e7",
                          }}
                        >
                          {payload[0].name}: {payload[0].value}
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-col gap-1.5 w-full">
                {langData.slice(0, 5).map((entry, i) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{
                          background:
                            LANG_COLORS[entry.name] ??
                            PIE_FALLBACK[i % PIE_FALLBACK.length],
                        }}
                      />
                      <span className="text-[11px] text-zinc-400">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-600 tabular-nums">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Bar chart + Recent snippets row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Snippets per member bar */}
        <ChartCard>
          <SectionHeading icon={TrendingUp} title="Top Contributors" />
          {isLoading ? (
            <Skel className="h-48 w-full" />
          ) : authorData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-700 text-[12px]">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={195}>
              <BarChart
                data={authorData}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  horizontal
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#52525b", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#52525b", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(20,184,166,0.05)" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {authorData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`rgba(20,184,166,${0.85 - i * 0.12})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Recent snippets list — 2/3 */}
        <ChartCard className="lg:col-span-2">
          <SectionHeading
            icon={Clock}
            title="Recent Snippets"
            action={
              <Link
                href={`/organization/${slug}/dashboard/snippets`}
                className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-400 transition-colors"
              >
                View all
                <ExternalLink className="size-3" strokeWidth={2} />
              </Link>
            }
          />
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skel key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentSnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Code2 className="size-8 text-zinc-800" strokeWidth={1.5} />
              <p className="text-zinc-700 text-[12px]">No snippets yet</p>
            </div>
          ) : (
            <div
              className="flex flex-col divide-y"
              style={{ borderColor: "rgba(20,184,166,0.08)" }}
            >
              {recentSnippets.map((s) => (
                <Link
                  key={s.id}
                  href={`/organization/${slug}/dashboard/snippets/${s.id}`}
                  className="flex items-center gap-3 py-3 group hover:bg-teal-950/10 rounded-xl px-2 -mx-2 transition-colors"
                >
                  {/* lang pill */}
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap"
                    style={{
                      background: `${LANG_COLORS[formatLang(s.language)] ?? "#2dd4bf"}18`,
                      color: LANG_COLORS[formatLang(s.language)] ?? "#2dd4bf",
                      border: `1px solid ${LANG_COLORS[formatLang(s.language)] ?? "#2dd4bf"}30`,
                    }}
                  >
                    {formatLang(s.language)}
                  </span>

                  {/* title */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-zinc-200 group-hover:text-teal-100 truncate transition-colors">
                      {s.title}
                    </p>
                    <p className="text-[10.5px] text-zinc-600 truncate">
                      {s.author?.name ?? "Unknown"} · {timeAgo(s.created_at)}
                    </p>
                  </div>

                  <ExternalLink
                    className="size-3.5 text-zinc-700 group-hover:text-teal-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    strokeWidth={2}
                  />
                </Link>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Team members strip ── */}
      {!isLoading && (
        <ChartCard>
          <SectionHeading
            icon={Users}
            title="Team Members"
            action={
              canManageMembers ? (
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                  Owner Controls
                </span>
              ) : undefined
            }
          />
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div
                className="size-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(96,165,250,0.08), rgba(59,130,246,0.04))",
                  border: "1px solid rgba(96,165,250,0.15)",
                }}
              >
                <Users className="size-5 text-blue-500/60" strokeWidth={1.6} />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-semibold text-zinc-400">
                  No members yet
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Invite people to your organization to collaborate
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all hover:border-teal-700/40"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="size-7 rounded-full flex items-center justify-center text-[11px] font-bold text-teal-200 shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#0f766e,#0d9488)",
                      boxShadow: "0 0 8px rgba(20,184,166,0.3)",
                    }}
                  >
                    {m.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-zinc-300 leading-none">
                      {m.user.name}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{m.role}</p>
                  </div>
                  {canManageMembers &&
                    m.role !== "OWNER" &&
                    m.userId !== Number(profile?.id) && (
                      <button
                        onClick={() => handleRemoveMember(m.id, m.user.name)}
                        disabled={removingMember && removingMemberId === m.id}
                        className="ml-2 inline-flex items-center justify-center size-8 rounded-lg border transition-all duration-150 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          borderColor: "rgba(239,68,68,0.25)",
                          color: "#f87171",
                        }}
                        title={`Remove ${m.user.name}`}
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      )}
    </div>
  );
}
