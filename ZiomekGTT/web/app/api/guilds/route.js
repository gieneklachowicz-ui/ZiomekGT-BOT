import { NextResponse } from "next/server";
import { getSession, getUserGuilds } from "../../../lib";

export async function GET() {
  try {
    const session = await getSession();

    console.log("GUILDS API - Session check:", {
      hasSession: !!session,
      hasUserId: !!session?.userId,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
    });

    if (!session) {
      console.log("GUILDS API - No session found");
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const guilds = await getUserGuilds(session);

    console.log("GUILDS API - Discord returned guilds:", {
      count: Array.isArray(guilds) ? guilds.length : 0,
      isArray: Array.isArray(guilds),
    });

    if (!Array.isArray(guilds)) {
      console.log("GUILDS API - Guilds is not an array:", guilds);
      return NextResponse.json(
        { error: "Invalid response from Discord" },
        { status: 500 }
      );
    }

    console.log("GUILDS API - Raw guilds:", guilds.map((g) => ({
      id: g.id,
      name: g.name,
      owner: g.owner,
      permissions: g.permissions,
      permissionsHex: BigInt(g.permissions || "0").toString(16),
    })));

    const manageableGuilds = guilds
      .filter((guild) => {
        // Właściciel serwera
        if (guild.owner === true) {
          console.log(`GUILDS API - ${guild.name}: Owner = true, INCLUDED`);
          return true;
        }

        // Administrator
        const permissions = BigInt(guild.permissions || "0");

        // MANAGE_GUILD = 0x20
        // ADMINISTRATOR = 0x8
        const hasManageGuild = (permissions & 0x20n) !== 0n;
        const hasAdmin = (permissions & 0x8n) !== 0n;

        const included = hasManageGuild || hasAdmin;

        console.log(`GUILDS API - ${guild.name}:`, {
          permissions: permissions.toString(16),
          hasManageGuild,
          hasAdmin,
          included,
        });

        return included;
      })
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner === true,
      }));

    console.log("GUILDS API - Final manageable guilds:", {
      count: manageableGuilds.length,
      guilds: manageableGuilds,
    });

    return NextResponse.json(manageableGuilds);
  } catch (error) {
    console.error("GUILDS API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać serwerów Discord.",
      },
      { status: 500 }
    );
  }
}