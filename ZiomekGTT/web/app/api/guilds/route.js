import { NextResponse } from "next/server";
import { getSession, getUserGuilds } from "../../../lib";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const guilds = await getUserGuilds(session);

    console.log("DISCORD GUILDS:", guilds);

    const manageableGuilds = guilds
      .filter((guild: any) => {
        // Właściciel serwera
        if (guild.owner === true) {
          return true;
        }

        // Administrator
        const permissions = BigInt(guild.permissions || "0");

        // MANAGE_GUILD = 0x20
        // ADMINISTRATOR = 0x8
        return (
          (permissions & 0x20n) !== 0n ||
          (permissions & 0x8n) !== 0n
        );
      })
      .map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner === true,
      }));

    console.log("MANAGEABLE GUILDS:", manageableGuilds);

    return NextResponse.json(manageableGuilds);
  } catch (error) {
    console.error("GUILDS ERROR:", error);

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