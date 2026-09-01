import React, { useEffect, useState } from "react";
import { api } from "../api";
import { PageHeader } from "./Dashboard";

export default function Projects(){
  const user=JSON.parse(localStorage.getItem("user")||"{}");const [projects,setProjects]=useState([]),[users,setUsers]=useState([]),[form,setForm]=useState({name:"",description:"",members:[]}),[error,setError]=useState("");
  async function load(){setProjects(await api.projects())}
  useEffect(()=>{load();api.users().then(setUsers)},[]);
  async function submit(e){e.preventDefault();try{await api.createProject(form);setForm({name:"",description:"",members:[]});load()}catch(e){setError(e.message)}}
  function toggle(id){setForm({...form,members:form.members.includes(id)?form.members.filter(x=>x!==id):[...form.members,id]})}
  return <section><PageHeader title="Projects" subtitle="Organize bugs by product or application."/>
    {user.role==="admin"&&<form className="panel form" onSubmit={submit}><h2>Create Project</h2>{error&&<div className="error">{error}</div>}<label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Members<div className="member-list">{users.map(u=><label className="check" key={u._id}><input type="checkbox" checked={form.members.includes(u._id)} onChange={()=>toggle(u._id)}/>{u.name} ({u.role})</label>)}</div></label><button className="primary">Create Project</button></form>}
    <div className="cards-grid">{projects.map(p=><div className="panel project-card" key={p._id}><h2>{p.name}</h2><p>{p.description||"No description"}</p><small>{p.members?.length||0} members</small></div>)}</div>
  </section>
}