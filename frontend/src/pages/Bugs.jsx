import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { PageHeader } from "./Dashboard";

export default function Bugs() {
  const [bugs,setBugs]=useState([]);
  const [search,setSearch]=useState("");
  const [status,setStatus]=useState("");
  const [priority,setPriority]=useState("");

  async function load() {
    const q = new URLSearchParams();
    if(search) q.set("search",search); if(status) q.set("status",status); if(priority) q.set("priority",priority);
    setBugs(await api.bugs(`?${q.toString()}`));
  }
  useEffect(()=>{load()},[status,priority]);

  return <section>
    <PageHeader title="Bugs" subtitle="Search, filter and manage reported issues." action={<Link className="primary btn" to="/bugs/new">+ New Bug</Link>} />
    <div className="toolbar">
      <input placeholder="Search bugs..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} />
      <select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{["open","in-progress","resolved","closed","reopened"].map(x=><option key={x}>{x}</option>)}</select>
      <select value={priority} onChange={e=>setPriority(e.target.value)}><option value="">All priorities</option>{["low","medium","high","critical"].map(x=><option key={x}>{x}</option>)}</select>
      <button className="secondary" onClick={load}>Search</button>
    </div>
    <div className="panel table-wrap"><table><thead><tr><th>Bug</th><th>Priority</th><th>Severity</th><th>Status</th><th>Project</th><th>Assigned</th></tr></thead>
    <tbody>{bugs.map(b=><tr key={b._id}><td><Link to={`/bugs/${b._id}`}><strong>{b.title}</strong></Link><small>{new Date(b.createdAt).toLocaleDateString()}</small></td><td><span className={`badge ${b.priority}`}>{b.priority}</span></td><td>{b.severity}</td><td><span className={`badge ${b.status}`}>{b.status}</span></td><td>{b.project?.name}</td><td>{b.assignedTo?.name || "Unassigned"}</td></tr>)}</tbody></table>
    {!bugs.length && <div className="empty">No bugs found.</div>}</div>
  </section>;
}