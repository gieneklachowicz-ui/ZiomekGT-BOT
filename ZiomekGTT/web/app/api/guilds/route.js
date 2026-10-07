import { NextResponse } from "next/server";
import { getSession,getUserGuilds,userCanManageGuild,discord } from "../../../lib";

export async function GET(){
  const s=await getSession();
  if(!s)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
  const userGuilds=await getUserGuilds(s);
  const botGuilds=await discord("/users/@me/guilds");
  const botIds=new Set(botGuilds.map(x=>x.id));
  const result=userGuilds
    .filter(g=>userCanManageGuild(g,s))
    .filter(g=>botIds.has(g.id))
    .map(g=>({id:g.id,name:g.name,icon:g.icon,owner:g.owner}));
  return NextResponse.json(result);
}
