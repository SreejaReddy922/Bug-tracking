import React, { useEffect, useState } from "react";
import { api } from "../api";
import { PageHeader } from "./Dashboard";

export default function Users(){
  const [users,setUsers]=useState([]);
  async function load(){setUsers(await api.users())}
  useEffect(()=>{load()},[]);
  async function role(id,value){await api.role(id,value);load()}
  return <section><PageHeader title="Users" subtitle="Manage team roles and permissions."/><div className="panel table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Change Role</th></tr></thead><tbody>{users.map(u=><tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><span className="badge">{u.role}</span></td><td><select value={u.role} onChange={e=>role(u._id,e.target.value)}><option value="admin">Admin</option><option value="developer">Developer</option><option value="tester">Tester</option></select></td></tr>)}</tbody></table></div></section>
}