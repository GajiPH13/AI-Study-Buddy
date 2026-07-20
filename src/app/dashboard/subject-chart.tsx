"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Props = { data: Array<{ subject: string; count: number }> };

const COLORS = ["#3157d5", "#2443aa", "#4a6fe8", "#6b8df0", "#a0b4f7"];

export function SubjectChart({ data }: Props) {
  if (data.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold mb-4">Sessions by subject</h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="subject" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${value} session${value !== 1 ? "s" : ""}`, "Sessions"]}
            labelFormatter={(label) => typeof label === "string" ? label.charAt(0).toUpperCase() + label.slice(1) : String(label)}
            contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: "12px" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
