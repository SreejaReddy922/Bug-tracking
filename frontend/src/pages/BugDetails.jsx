import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, API_BASE } from "../api";

export default function BugDetails(){
  const {id}=useParams(); const [bug,setBug]=useState(null); const [users,setUsers]=useState([]); const [comment,setComment]=useState(""); const user=JSON.parse(localStorage.getItem("user")||"{}");
  async function load(){setBug(await api.bug(id))}
  useEffect(()=>{load();api.users().then(setUsers)},[id]);
  if(!bug)return <div className="loading">Loading bug...</div>;

  async function status(e){await api.status(id,e.target.value);load()}
  async function assign(e){await api.assign(id,e.target.value);load()}
  async function addComment(e){e.preventDefault();if(!comment.trim())return;await api.comment(id,comment);setComment("");load()}
  async function remove(){if(confirm("Delete this bug?")){await api.deleteBug(id);location.href="/bugs"}}

  return <section>
    <div className="page-header"><div><Link to="/bugs">← Back to bugs</Link><h1>{bug.title}</h1><p>Reported by {bug.reportedBy?.name} on {new Date(bug.createdAt).toLocaleString()}</p></div>{user.role==="admin"&&<button className="danger" onClick={remove}>Delete</button>}</div>
    <div className="details-grid">
      <div className="panel">
        <div className="badges"><span className={`badge ${bug.priority}`}>{bug.priority}</span><span className={`badge ${bug.status}`}>{bug.status}</span><span className="badge">{bug.severity}</span></div>
        <h3>Description</h3><p className="pre">{bug.description}</p>
        <h3>Steps to Reproduce</h3><p className="pre">{bug.stepsToReproduce||"Not provided"}</p>
        <div className="form-grid"><div><h3>Expected</h3><p className="pre">{bug.expectedResult||"Not provided"}</p></div><div><h3>Actual</h3><p className="pre">{bug.actualResult||"Not provided"}</p></div></div>
        {bug.attachments?.length>0&&<><h3>Attachments</h3><div className="attachments">{bug.attachments.map(a=><a key={a} href={API_BASE+a} target="_blank">{a.split("/").pop()}</a>)}</div></>}
      </div>
      <div>
        <div className="panel">
          <h2>Workflow</h2>
          <label>Status<select value={bug.status} onChange={status}>{["open","in-progress","resolved","closed","reopened"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Assigned Developer<select value={bug.assignedTo?._id||""} onChange={assign}><option value="">Unassigned</option>{users.filter(u=>u.role==="developer").map(u=><option key={u._id} value={u._id}>{u.name}</option>)}</select></label>
        </div>
        <div className="panel"><h2>Comments</h2>{bug.comments?.map(c=><div className="comment" key={c._id}><strong>{c.user?.name}</strong><small>{new Date(c.createdAt).toLocaleString()}</small><p>{c.text}</p></div>)}<form onSubmit={addComment} className="comment-form"><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a comment..."/><button className="primary">Add Comment</button></form></div>
        <div className="panel"><h2>Activity</h2>{[...(bug.activity||[])].reverse().map(a=><div className="activity" key={a._id}><strong>{a.user?.name||"User"}</strong> {a.action}<small>{new Date(a.createdAt).toLocaleString()}</small></div>)}</div>
      </div>
    </div>
  </section>;
}