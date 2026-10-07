import { NextResponse } from "next/server";
import {
  getSession,
  getUserGuilds,
  userCanManageGuild,
} from "../../../lib";

export async function GET() {
  try {
    const s = await getSession();

    if (!s) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const userGuilds = await getUserGuilds(s);

    const result = userGuilds
      .filter((g: any) => userCanManageGuild(g, g))
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GUILDS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać serwerów.",
      },
      { status: 500 }
    );
  }
}