"use client";
import {useEffect,useState} from "react";

export default function Dashboard(){
 const [me,setMe]=useState(null),[guilds,setGuilds]=useState([]),[gid,setGid]=useState(""),
 [channels,setChannels]=useState([]),[roles,setRoles]=useState([]),[cfg,setCfg]=useState(null),[msg,setMsg]=useState("");
 useEffect(()=>{fetch("/api/me").then(r=>r.ok?r.json():null).then(x=>{if(!x?.authenticated)location.href="/";else{setMe(x.user);loadGuilds()}})},[]);
 async function loadGuilds(){const r=await fetch("/api/guilds");if(r.ok)setGuilds(await r.json())}
 async function selectGuild(id){
  setGid(id);setMsg("");
  const [c,r,conf]=await Promise.all([fetch(`/api/guilds/${id}/channels`),fetch(`/api/guilds/${id}/roles`),fetch(`/api/guilds/${id}/config`)]);
  setChannels(await c.json());setRoles(await r.json());setCfg(await conf.json());
 }
 function patch(k,v){setCfg(x=>({...x,[k]:v}))}
 async function save(){
  setMsg("Zapisywanie...");
  const r=await fetch(`/api/guilds/${gid}/config`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(cfg)});
  const j=await r.json();setMsg(r.ok?"✅ Zapisano. Bot odświeży panel automatycznie.":"❌ "+(j.error||"Błąd"));
 }
 if(!me)return <main className="center"><div className="card">Ładowanie...</div></main>;
 return <main className="dashboard"><aside><div className="brand"><span>Z</span> ZiomekGT</div>
  <nav><a className="active">⚙️ Konfiguracja</a><a>📋 Rekrutacja</a><a>🔐 Uprawnienia</a></nav>
  <button className="logout" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});location.href="/"}}>Wyloguj</button>
 </aside><section className="content">
  <header><div><small>PANEL ZARZĄDZANIA</small><h1>Konfiguracja</h1></div><div className="user">{me.globalName||me.username}</div></header>
  <div className="panel top"><label>Serwer Discord</label><select value={gid} onChange={e=>selectGuild(e.target.value)}>
    <option value="">Wybierz serwer</option>{guilds.map(g=><option value={g.id} key={g.id}>{g.name}</option>)}</select>
  </div>
  {cfg&&<><div className="grid">
   <article className="panel"><h2>📍 Panel</h2>
    <label>Kanał</label><select value={cfg.panel_channel_id||""} onChange={e=>patch("panel_channel_id",e.target.value||null)}>
     <option value="">Wybierz kanał</option>{channels.filter(c=>c.type===0).map(c=><option value={c.id} key={c.id}># {c.name}</option>)}</select>
    <label>Tytuł</label><input value={cfg.panel_title} onChange={e=>patch("panel_title",e.target.value)}/>
    <label>Opis</label><textarea value={cfg.panel_description} onChange={e=>patch("panel_description",e.target.value)}/>
    <label>Stopka</label><input value={cfg.panel_footer} onChange={e=>patch("panel_footer",e.target.value)}/>
   </article>
   <article className="panel"><h2>🔐 Prywatne zgłoszenia</h2><p className="muted">Te role dostaną dostęp do kanałów rekrutacyjnych.</p>
    <div className="roles">{roles.filter(r=>r.name!=="@everyone").map(r=><label key={r.id}><input type="checkbox" checked={cfg.access_roles.includes(r.id)} onChange={e=>patch("access_roles",e.target.checked?Array.from(new Set([...cfg.access_roles,r.id])):cfg.access_roles.filter(x=>x!==r.id))}/>{r.name}</label>)}</div>
   </article>
  </div><article className="panel"><h2>🎯 Rangi i wymagania</h2><div className="roleGrid">
   {[["ticket","🎫"],["helper","🛠️"],["admin","🛡️"],["cowowner","👑"]].map(([k,e])=><div className="role" key={k}>
    <b>{e} {cfg[k+"_name"]}</b><label><input type="checkbox" checked={cfg[k+"_enabled"]} onChange={x=>patch(k+"_enabled",x.target.checked)}/> Włączona</label>
    <label><input type="checkbox" checked={cfg[k+"_email"]} onChange={x=>patch(k+"_email",x.target.checked)}/> Email</label>
    <label><input type="checkbox" checked={cfg[k+"_over13"]} onChange={x=>patch(k+"_over13",x.target.checked)}/> Powyżej 13 lat</label>
    <label><input type="checkbox" checked={cfg[k+"_voice"]} onChange={x=>patch(k+"_voice",x.target.checked)}/> Mutacja głosu</label>
    <input value={cfg[k+"_name"]} onChange={x=>patch(k+"_name",x.target.value)}/>
   </div>)}</div></article>
   <div className="saveRow"><button className="save" onClick={save}>💾 Zapisz konfigurację</button>{msg&&<span>{msg}</span>}</div></>}
 </section></main>
}