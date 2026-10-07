import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";

export const DISCORD_API="https://discord.com/api/v10";
const COOKIE="ziomekgt_session";

export function redis(){
  if(!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
    throw new Error("Brak UPSTASH_REDIS_REST_URL lub UPSTASH_REDIS_REST_TOKEN.");
  return Redis.fromEnv();
}
export const configKey=(gid)=>`ziomekgt:config:${gid}`;
export const rolesKey=(gid)=>`ziomekgt:roles:${gid}`;
export const applicationsKey=(gid)=>`ziomekgt:applications:${gid}`;

export function defaults(){
 return {
  panel_title:"REKRUTACJA",
  panel_description:"Jeśli chcesz iść na rangę administratora, musisz wypełnić te rzeczy ⬇️",
  panel_footer:"ZiomekGT • Rekrutacja",
  panel_channel_id:null,
  panel_message_id:null,
  ticket_enabled:true,helper_enabled:true,admin_enabled:true,cowowner_enabled:true,
  ticket_email:false,helper_email:false,admin_email:true,cowowner_email:true,
  ticket_over13:true,helper_over13:true,admin_over13:true,cowowner_over13:true,
  ticket_voice:true,helper_voice:true,admin_voice:true,cowowner_voice:true,
  ticket_name:"Ticket",helper_name:"Helper",admin_name:"Administrator",cowowner_name:"Co-Owner"
 };
}
export async function getConfig(gid){
 const r=redis(); const saved=await r.get(configKey(gid)); return {...defaults(),...(saved||{})};
}
export async function setConfig(gid,data){
 const r=redis(); await r.set(configKey(gid),data); return data;
}
export async function getAccessRoles(gid){ return (await redis().smembers(rolesKey(gid)))||[]; }
export async function setAccessRoles(gid,ids){
 const r=redis(); await r.del(rolesKey(gid)); if(ids?.length) await r.sadd(rolesKey(gid),...ids.map(String));
 return ids||[];
}

export function sessionEncode(data){
 const payload=Buffer.from(JSON.stringify({...data,exp:Date.now()+1000*60*60*24*7})).toString("base64url");
 const sig=crypto.createHmac("sha256",process.env.SESSION_SECRET).update(payload).digest("base64url");
 return `${payload}.${sig}`;
}
export function sessionDecode(value){
 try{
  if(!value||!process.env.SESSION_SECRET)return null;
  const [p,s]=value.split("."); if(!p||!s)return null;
  const expected=crypto.createHmac("sha256",process.env.SESSION_SECRET).update(p).digest("base64url");
  if(s.length!==expected.length || !crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return null;
  const data=JSON.parse(Buffer.from(p,"base64url").toString());
  return data.exp>Date.now()?data:null;
 }catch{return null;}
}
export async function getSession(){ const jar=await cookies(); return sessionDecode(jar.get(COOKIE)?.value); }
export async function discord(pathname,options={}){
 const r=await fetch(DISCORD_API+pathname,{...options,headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`,...(options.headers||{})},cache:"no-store"});
 const data=await r.json().catch(()=>null); if(!r.ok)throw new Error(data?.message||`Discord API ${r.status}`); return data;
}
export function userCanManageGuild(guild,user){
 if(!guild||!user)return false; if(guild.owner===true)return true;
 const perms=BigInt(guild.permissions||"0"); return (perms&0x20n)!==0n||(perms&0x8n)!==0n;
}
export async function getUserGuilds(session){
 const r=await fetch(`${DISCORD_API}/users/@me/guilds`,{headers:{Authorization:`Bearer ${session.accessToken}`},cache:"no-store"});
 if(!r.ok)throw new Error("Nie udało się pobrać serwerów Discord."); return r.json();
}
export function redirectUri(){return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;}
