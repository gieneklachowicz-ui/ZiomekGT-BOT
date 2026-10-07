import { NextResponse } from "next/server";
import { getSession,getUserGuilds,userCanManageGuild,discord,getConfig,setConfig,getAccessRoles,setAccessRoles } from "../../../../../lib";

async function auth(gid){
 const s=await getSession(); if(!s)return [null,NextResponse.json({error:"UNAUTHORIZED"},{status:401})];
 const gs=await getUserGuilds(s); const g=gs.find(x=>x.id===gid);
 if(!userCanManageGuild(g,s))return [null,NextResponse.json({error:"FORBIDDEN"},{status:403})];
 try{await discord(`/guilds/${gid}`);}catch{return [null,NextResponse.json({error:"BOT_NOT_IN_GUILD"},{status:400})]}
 return [s,null];
}
export async function GET(req,{params}){
 const {guildId}=await params; const [,err]=await auth(guildId); if(err)return err;
 const cfg=await getConfig(guildId); cfg.access_roles=await getAccessRoles(guildId); return NextResponse.json(cfg);
}
export async function PUT(req,{params}){
 const {guildId}=await params; const [,err]=await auth(guildId); if(err)return err;
 const body=await req.json(); const cfg={...(await getConfig(guildId)),...body};
 const channels=await discord(`/guilds/${guildId}/channels`);
 if(cfg.panel_channel_id&&!channels.some(c=>c.id===String(cfg.panel_channel_id)&&c.type===0))return NextResponse.json({error:"INVALID_CHANNEL"},{status:400});
 const roles=await discord(`/guilds/${guildId}/roles`); const valid=new Set(roles.filter(r=>!r.managed).map(r=>r.id));
 const access=(cfg.access_roles||[]).map(String);
 if(access.some(id=>!valid.has(id)))return NextResponse.json({error:"INVALID_ROLE"},{status:400});
 delete cfg.access_roles; await setConfig(guildId,cfg); await setAccessRoles(guildId,access);
 return NextResponse.json({ok:true,config:{...cfg,access_roles:access},message:"Zapisano. Bot odświeży panel automatycznie."});
}
