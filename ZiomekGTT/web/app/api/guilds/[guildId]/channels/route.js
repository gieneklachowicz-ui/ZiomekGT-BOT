import { NextResponse } from "next/server";
import { getSession,getUserGuilds,userCanManageGuild,discord } from "../../../../../lib";

export async function GET(req,{params}){
  const s=await getSession(); if(!s)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
  const {guildId}=await params;
  const gs=await getUserGuilds(s); const g=gs.find(x=>x.id===guildId);
  if(!userCanManageGuild(g,s))return NextResponse.json({error:"FORBIDDEN"},{status:403});
  const channels=await discord(`/guilds/${guildId}/channels`);
  return NextResponse.json(channels.filter(c=>c.type===0||c.type===4).map(c=>({id:c.id,name:c.name,type:c.type,parent_id:c.parent_id})));
}
