import { NextResponse } from "next/server";
import { discord } from "../../../../../lib";

export async function GET(req, { params }) {
  const { guildId } = await params;

  try {
    await discord(`/guilds/${guildId}`);

    return NextResponse.json({ botInGuild: true });
  } catch (error) {
    return NextResponse.json({ botInGuild: false });
  }
}
