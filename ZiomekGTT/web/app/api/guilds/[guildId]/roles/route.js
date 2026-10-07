import { NextResponse } from "next/server";
import { getSession,getUserGuilds,userCanManageGuild,discord } from "../../../../../lib";

export async function GET(req,{params}){
  const s=await getSession(); if(!s)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
  const {guildId}=await params;
  const gs=await getUserGuilds(s); const g=gs.find(x=>x.id===guildId);
  if(!userCanManageGuild(g,s))return NextResponse.json({error:"FORBIDDEN"},{status:403});
  const roles=await discord(`/guilds/${guildId}/roles`);
  return NextResponse.json(roles.filter(r=>!r.managed).map(r=>({id:r.id,name:r.name,position:r.position,color:r.color})));
}
