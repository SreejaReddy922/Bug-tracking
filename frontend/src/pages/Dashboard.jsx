import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.stats().then(setData).catch(console.error); }, []);
  if (!data) return <div className="loading">Loading dashboard...</div>;

  const cards = [
    ["Total Bugs", data.total], ["Open", data.open], ["In Progress", data.inProgress],
    ["Resolved", data.resolved], ["Closed", data.closed], ["Critical", data.critical]
  ];
  const chartData = data.byPriority.map(x => ({ name:x._id, count:x.count }));

  return <section>
    <PageHeader title="Dashboard" subtitle="Overview of your software quality." />
    <div className="stats-grid">{cards.map(([label,value])=><div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="panel chart-panel"><h2>Bugs by Priority</h2><div className="chart"><ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count"/></BarChart></ResponsiveContainer></div></div>
  </section>;
}

export function PageHeader({title,subtitle,action}) {
  return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}