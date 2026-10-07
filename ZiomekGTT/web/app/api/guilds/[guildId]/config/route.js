import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { getSession,getUserGuilds,userCanManageGuild,discord,DB_FILE } from "../../../../../lib";

function defaults(){
 return {
  panel_title:"REKRUTACJA",
  panel_description:"Jeśli chcesz iść na rangę administratora, musisz wypełnić te rzeczy ⬇️",
  panel_footer:"ZiomekGT • Rekrutacja",
  panel_channel_id:null,
  ticket_enabled:true,helper_enabled:true,admin_enabled:true,cowowner_enabled:true,
  ticket_email:false,helper_email:false,admin_email:true,cowowner_email:true,
  ticket_over13:true,helper_over13:true,admin_over13:true,cowowner_over13:true,
  ticket_voice:true,helper_voice:true,admin_voice:true,cowowner_voice:true,
  ticket_name:"Ticket",helper_name:"Helper",admin_name:"Administrator",cowowner_name:"Co-Owner",
  access_roles:[]
 };
}
function read(gid){
 const d=defaults(); const db=new Database(DB_FILE);
 const s=db.prepare("SELECT key,value FROM settings WHERE guild_id=?").all(gid);
 for(const x of s){
  d[x.key]=["1","true"].includes(x.value)?true:["0","false"].includes(x.value)?false:x.value;
 }
 const c=db.prepare("SELECT panel_channel_id FROM guild_config WHERE guild_id=?").get(gid);
 d.panel_channel_id=c?.panel_channel_id||null;
 d.access_roles=db.prepare("SELECT role_id FROM access_roles WHERE guild_id=?").all(gid).map(x=>x.role_id);
 db.close(); return d;
}
function write(gid,data){
 const db=new Database(DB_FILE);
 db.exec(`CREATE TABLE IF NOT EXISTS guild_config(guild_id INTEGER PRIMARY KEY,panel_channel_id INTEGER,panel_message_id INTEGER);
          CREATE TABLE IF NOT EXISTS settings(guild_id INTEGER,key TEXT,value TEXT,PRIMARY KEY(guild_id,key));
          CREATE TABLE IF NOT EXISTS access_roles(guild_id INTEGER,role_id INTEGER,PRIMARY KEY(guild_id,role_id));`);
 const tx=db.transaction(()=>{
  db.prepare(`INSERT INTO guild_config(guild_id,panel_channel_id) VALUES(?,?)
    ON CONFLICT(guild_id) DO UPDATE SET panel_channel_id=excluded.panel_channel_id`).run(gid,data.panel_channel_id||null);
  for(const [k,v] of Object.entries(data)){
   if(k==="panel_channel_id"||k==="access_roles")continue;
   db.prepare(`INSERT INTO settings(guild_id,key,value) VALUES(?,?,?)
     ON CONFLICT(guild_id,key) DO UPDATE SET value=excluded.value`).run(gid,k,typeof v==="boolean"?(v?"1":"0"):String(v));
  }
  db.prepare("DELETE FROM access_roles WHERE guild_id=?").run(gid);
  for(const id of (data.access_roles||[])) db.prepare("INSERT OR IGNORE INTO access_roles(guild_id,role_id) VALUES(?,?)").run(gid,id);
 });
 tx(); db.close();
}
async function auth(gid){
 const s=await getSession(); if(!s) return [null,NextResponse.json({error:"UNAUTHORIZED"},{status:401})];
 const gs=await getUserGuilds(s); const g=gs.find(x=>x.id===gid);
 if(!userCanManageGuild(g,s))return [null,NextResponse.json({error:"FORBIDDEN"},{status:403})];
 try{await discord(`/guilds/${gid}`);}catch{return [null,NextResponse.json({error:"BOT_NOT_IN_GUILD"},{status:400})]}
 return [s,null];
}
export async function GET(req,{params}){
 const {guildId}=await params; const [,err]=await auth(guildId); if(err)return err;
 return NextResponse.json(read(guildId));
}
export async function PUT(req,{params}){
 const {guildId}=await params; const [,err]=await auth(guildId); if(err)return err;
 const body=await req.json();
 const d={...defaults(),...body};
 const channels=await discord(`/guilds/${guildId}/channels`);
 if(d.panel_channel_id && !channels.some(c=>c.id===String(d.panel_channel_id)&&c.type===0))
   return NextResponse.json({error:"INVALID_CHANNEL"},{status:400});
 const roles=await discord(`/guilds/${guildId}/roles`);
 const valid=new Set(roles.map(r=>r.id));
 if((d.access_roles||[]).some(id=>!valid.has(String(id))))
   return NextResponse.json({error:"INVALID_ROLE"},{status:400});
 write(guildId,d);
 return NextResponse.json({ok:true,config:read(guildId),message:"Zapisano. Bot odświeży panel automatycznie."});
}
