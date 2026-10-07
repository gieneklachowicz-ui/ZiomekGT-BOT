import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

export const DB_FILE=path.resolve(process.cwd(),process.env.DATABASE_FILE||"../../ziomekgt.db");
export const DISCORD_API="https://discord.com/api/v10";
const COOKIE="ziomekgt_session";

export function dbQuery(sql,params=[],mode="all"){
  // SQLite access is intentionally kept in one place.
  // Requires better-sqlite3 in production; the starter uses a tiny JSON-free
  // configuration layer and expects the same machine as the bot.
  throw new Error("SQLite adapter not installed. Use the included API adapter setup or add better-sqlite3.");
}

export function sessionEncode(data){
  const payload=Buffer.from(JSON.stringify({...data,exp:Date.now()+1000*60*60*24*7})).toString("base64url");
  const sig=crypto.createHmac("sha256",process.env.SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
export function sessionDecode(value){
  if(!value)return null;
  const [p,s]=value.split(".");
  if(!p||!s)return null;
  const expected=crypto.createHmac("sha256",process.env.SESSION_SECRET).update(p).digest("base64url");
  if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return null;
  const data=JSON.parse(Buffer.from(p,"base64url").toString());
  if(data.exp<Date.now())return null;
  return data;
}
export async function getSession(){
  const jar=await cookies();
  return sessionDecode(jar.get(COOKIE)?.value);
}
export async function discord(pathname,options={}){
  const r=await fetch(DISCORD_API+pathname,{
    ...options,headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`,...(options.headers||{})},
    cache:"no-store"
  });
  const data=await r.json().catch(()=>null);
  if(!r.ok)throw new Error(data?.message||`Discord API ${r.status}`);
  return data;
}
export function userCanManageGuild(guild,user){
  if(!guild||!user)return false;
  if(guild.owner===true)return true;
  const perms=BigInt(guild.permissions||"0");
  return (perms & 0x20n)!==0n || (perms & 0x8n)!==0n;
}
export async function getUserGuilds(session){
  const r=await fetch(`${DISCORD_API}/users/@me/guilds`,{
    headers:{Authorization:`Bearer ${session.accessToken}`},cache:"no-store"
  });
  if(!r.ok)throw new Error("Nie udało się pobrać serwerów Discord.");
  return r.json();
}
export function redirectUri(){
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
}
