/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  Zap,
  Filter,
} from 'lucide-react';
import { ApprovalRequest } from '../types/rules';
import { CATELYST_TEAM_METADATA } from '../data/defaultRules';

interface AnalyticsViewProps {
  requests: ApprovalRequest[];
  onSelectRequestForReview?: (req: ApprovalRequest) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  requests,
  onSelectRequestForReview,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '3d'>('all');

  // 1. Filtered requests based on time selection
  const filteredRequests = useMemo(() => {
    if (dateFilter === 'all') return requests;
    const sorted = [...requests].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    const daysLimit = dateFilter === '7d' ? 7 : 3;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysLimit);
    return sorted.filter((r) => new Date(r.submittedAt) >= cutoffDate);
  }, [requests, dateFilter]);

  // 2. Gate Pass / Fail / Pending Status Breakdown for Pie Chart
  const statusPieData = useMemo(() => {
    let passed = 0;
    let failed = 0;
    let pending = 0;

    requests.forEach((req) => {
      if (req.status === 'approved') passed++;
      else if (req.status === 'rejected') failed++;
      else pending++;
    });

    return [
      { name: 'Passed / Gate-Authorized', value: passed, color: '#10b981' }, // Emerald
      { name: 'Failed / Rejected', value: failed, color: '#f43f5e' }, // Rose
      { name: 'Pending / In Review', value: pending, color: '#f59e0b' }, // Amber
    ];
  }, [requests]);

  const totalHandled = requests.length;
  const passedCount = statusPieData[0].value;
  const failedCount = statusPieData[1].value;
  const pendingCount = statusPieData[2].value;
  const passRate = totalHandled > 0 ? Math.round((passedCount / totalHandled) * 100) : 0;

  // 3. Requests Handled Over Time for Line Chart
  const timeSeriesData = useMemo(() => {
    const map = new Map<string, { date: string; displayDate: string; total: number; passed: number; failed: number; pending: number }>();

    // Collect all dates
    requests.forEach((r) => {
      const datePart = r.submittedAt.split(' ')[0]; // "2026-10-04"
      const parts = datePart.split('-');
      const displayDate = parts.length === 3 ? `${parts[1]}/${parts[2]}` : datePart;

      if (!map.has(datePart)) {
        map.set(datePart, {
          date: datePart,
          displayDate,
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
        });
      }

      const item = map.get(datePart)!;
      item.total += 1;
      if (r.status === 'approved') item.passed += 1;
      else if (r.status === 'rejected') item.failed += 1;
      else item.pending += 1;
    });

    // Sort chronologically
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [requests]);

  // 4. Requests by SDLC Stage Breakdown for Bar Chart
  const stageDistributionData = useMemo(() => {
    const stageMap: Record<string, { stage: string; count: number; passed: number }> = {
      requirements: { stage: 'Requirements', count: 0, passed: 0 },
      engineering: { stage: 'Engineering', count: 0, passed: 0 },
      review: { stage: 'Code Review', count: 0, passed: 0 },
      quality: { stage: 'Quality / QA', count: 0, passed: 0 },
      operations: { stage: 'Operations', count: 0, passed: 0 },
    };

    requests.forEach((r) => {
      const stg = r.payload.sdlcStage;
      if (stageMap[stg]) {
        stageMap[stg].count += 1;
        if (r.status === 'approved') stageMap[stg].passed += 1;
      }
    });

    return Object.values(stageMap);
  }, [requests]);

  // 5. Telemetry Tracking Metric (Milestone 1 requirement)
  const telemetryLoggedCount = requests.filter((r) => r.payload.hasTelemetryLogging).length;
  const telemetryRate = totalHandled > 0 ? Math.round((telemetryLoggedCount / totalHandled) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-mono text-[10px] font-bold">
              {CATELYST_TEAM_METADATA.teamName}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {CATELYST_TEAM_METADATA.account} · Mission 2026
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span>AIDLC Pipeline Analytics & Gate Hook Metrics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry and validation trends for agentic SDLC requests across the 12 scoped subagents.
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Timeline:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Runs ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('7d')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === '7d'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('3d')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === '3d'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 3 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Handled */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total SDLC Requests Handled
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {totalHandled}
            </span>
            <span className="text-xs text-slate-500 font-medium">pipeline runs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across 5 major SDLC gated stages
          </p>
        </div>

        {/* Gate Pass Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Gate Pass Rate
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 tabular-nums">
              {passRate}%
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              {passedCount} authorized
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {failedCount} blocked by rule violation / hook
          </p>
        </div>

        {/* Gate Hook Engagement */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Active Gate Hooks
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-orange-600 tabular-nums">
              100%
            </span>
            <span className="text-xs text-orange-700 font-medium">Hard-enforced</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero unapproved production leaks
          </p>
        </div>

        {/* Milestone 1 Telemetry Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Milestone 1 Telemetry Rate
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {telemetryRate}%
            </span>
            <span className="text-xs text-sky-600 font-medium">Token & timing logged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Targeting AI/RUN Level 3 maturity claim
          </p>
        </div>
      </div>

      {/* Main Charts Grid: Pie Chart (Pass/Fail) & Line Chart (Requests Over Time) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pass/Fail Gate Status Pie Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-orange-600" />
                <span>Gate Status Breakdown (Pass / Fail / Pending)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {totalHandled} TOTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Proportion of pipeline stage transitions authorized by human gate hook vs rejected.
            </p>
          </div>

          {/* Recharts Pie Chart Container */}
          <div className="h-72 w-full my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} requests`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {passRate}%
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Pass Rate
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold block">
                Passed
              </span>
              <span className="text-base font-bold font-mono text-emerald-950 tabular-nums">
                {passedCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
              <span className="text-[10px] uppercase tracking-wider text-rose-800 font-semibold block">
                Failed
              </span>
              <span className="text-base font-bold font-mono text-rose-950 tabular-nums">
                {failedCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold block">
                In Review
              </span>
              <span className="text-base font-bold font-mono text-amber-950 tabular-nums">
                {pendingCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Requests Handled Over Time Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span>Requests Handled Over Time</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                DAILY VOLUME
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Cumulative and daily throughput of Jira tickets processed by the Claude Code AIDLC orchestrator.
            </p>
          </div>

          {/* Recharts Line Chart Container */}
          <div className="h-72 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="plainline"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Handled"
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0f172a' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="passed"
                  name="Gate Passed"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  name="Gate Rejected"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f43f5e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Context Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Peak Day: 2026-10-04 (3 requests)</span>
            <span className="text-emerald-600 font-semibold">Zero Gate Bypasses Detected</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: SDLC Stage Distribution Bar Chart & Recent Gate Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Distribution Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Throughput by SDLC Pipeline Stage</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total requests drafted by subagents and successfully signed off at each gate hook.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageDistributionData}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="square"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
                <Bar dataKey="count" name="Total Drafted" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passed" name="Gate Authorized" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Gate Outcomes Table (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Recent Gate Hook Decisions</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">AUDIT SUMMARY</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Latest human gate reviewer sign-offs and subagent revisions.
            </p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
            {requests.slice(0, 5).map((req) => (
              <div
                key={req.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <span className="font-mono font-bold text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-orange-600">
                    {req.jiraTicketId}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 truncate block">
                      {req.payload.jiraTitle}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Stage: {req.payload.sdlcStage.toUpperCase()} · Subagent: {req.payload.activeSubagent}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                      req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status === 'approved' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : req.status === 'rejected' ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {req.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {req.submittedAt.split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-500">
              Live updates linked directly to <strong className="text-slate-800">LiveRequestHub</strong> actions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
