import { redirect } from "next/navigation";
import { redirectUri } from "../../../../lib";

export async function GET(){
  const params=new URLSearchParams({
    client_id:process.env.DISCORD_CLIENT_ID,
    redirect_uri:redirectUri(),
    response_type:"code",
    scope:"identify guilds",
    prompt:"consent"
  });
  redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
}
