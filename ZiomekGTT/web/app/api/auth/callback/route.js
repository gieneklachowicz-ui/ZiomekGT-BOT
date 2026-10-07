import { NextResponse } from "next/server";
import { redirectUri, sessionEncode } from "../../../../lib";

export async function GET(req){
  const url=new URL(req.url);
  const code=url.searchParams.get("code");
  if(!code)return NextResponse.redirect(new URL("/?error=oauth_cancelled",req.url));

  const body=new URLSearchParams({
    client_id:process.env.DISCORD_CLIENT_ID,
    client_secret:process.env.DISCORD_CLIENT_SECRET,
    grant_type:"authorization_code",
    code,
    redirect_uri:redirectUri()
  });
  const tokenRes=await fetch("https://discord.com/api/v10/oauth2/token",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body
  });
  const token=await tokenRes.json();
  if(!tokenRes.ok)return NextResponse.redirect(new URL("/?error=oauth_token",req.url));

  const meRes=await fetch("https://discord.com/api/v10/users/@me",{
    headers:{Authorization:`Bearer ${token.access_token}`}
  });
  const me=await meRes.json();
  if(!meRes.ok)return NextResponse.redirect(new URL("/?error=oauth_user",req.url));

  const res=NextResponse.redirect(new URL("/dashboard",req.url));
  res.cookies.set("ziomekgt_session",sessionEncode({
    userId:me.id,username:me.username,globalName:me.global_name||me.username,
    avatar:me.avatar||null,accessToken:token.access_token
  }),{
    httpOnly:true,secure:process.env.NODE_ENV==="production",
    sameSite:"lax",path:"/",maxAge:60*60*24*7
  });
  return res;
}
