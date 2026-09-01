import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { PageHeader } from "./Dashboard";

export default function CreateBug() {
  const [projects,setProjects]=useState([]),[users,setUsers]=useState([]),[error,setError]=useState("");
  const [form,setForm]=useState({title:"",description:"",stepsToReproduce:"",expectedResult:"",actualResult:"",priority:"medium",severity:"major",project:"",assignedTo:""});
  const [files,setFiles]=useState([]);
  const navigate=useNavigate();
  useEffect(()=>{Promise.all([api.projects(),api.users()]).then(([p,u])=>{setProjects(p);setUsers(u.filter(x=>x.role==="developer"))}).catch(e=>setError(e.message))},[]);

  function change(e){setForm({...form,[e.target.name]:e.target.value})}
  async function submit(e){
    e.preventDefault(); setError("");
    try{
      const fd=new FormData(); Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      files.forEach(f=>fd.append("attachments",f));
      const bug=await api.createBug(fd); navigate(`/bugs/${bug._id}`);
    }catch(e){setError(e.message)}
  }

  return <section><PageHeader title="Report a Bug" subtitle="Capture enough detail for a developer to reproduce the issue."/>
    <form className="panel form bug-form" onSubmit={submit}>
      {error&&<div className="error">{error}</div>}
      <div className="form-grid">
        <label>Title<input name="title" value={form.title} onChange={change} required /></label>
        <label>Project<select name="project" value={form.project} onChange={change} required><option value="">Select project</option>{projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
        <label>Priority<select name="priority" value={form.priority} onChange={change}>{["low","medium","high","critical"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Severity<select name="severity" value={form.severity} onChange={change}>{["minor","major","critical","blocker"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Assign Developer<select name="assignedTo" value={form.assignedTo} onChange={change}><option value="">Unassigned</option>{users.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}</select></label>
      </div>
      <label>Description<textarea name="description" value={form.description} onChange={change} required /></label>
      <label>Steps to Reproduce<textarea name="stepsToReproduce" value={form.stepsToReproduce} onChange={change} placeholder="1. Open... 2. Click..." /></label>
      <div className="form-grid"><label>Expected Result<textarea name="expectedResult" value={form.expectedResult} onChange={change}/></label><label>Actual Result<textarea name="actualResult" value={form.actualResult} onChange={change}/></label></div>
      <label>Attachments<input type="file" multiple onChange={e=>setFiles([...e.target.files])}/></label>
      <button className="primary">Create Bug</button>
    </form>
  </section>;
}