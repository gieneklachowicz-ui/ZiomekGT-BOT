"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [gid, setGid] = useState("");
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [cfg, setCfg] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    try {
      const r = await fetch("/api/me", {
        cache: "no-store",
      });

      if (!r.ok) {
        window.location.href = "/";
        return;
      }

      const x = await r.json();

      if (!x?.authenticated) {
        window.location.href = "/";
        return;
      }

      setMe(x.user);
      loadGuilds();
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      window.location.href = "/";
    }
  }

  async function loadGuilds() {
    try {
      setMsg("Ładowanie serwerów...");

      const r = await fetch("/api/guilds", {
        cache: "no-store",
      });

      const data = await r.json();

      console.log("GUILDS RESPONSE:", data);

      if (!r.ok) {
        setMsg(
          "❌ " +
            (data?.error || "Nie udało się pobrać serwerów Discord.")
        );
        return;
      }

      if (!Array.isArray(data)) {
        setMsg("❌ Discord nie zwrócił listy serwerów.");
        return;
      }

      setGuilds(data);

      if (data.length === 0) {
        setMsg(
          "❌ Nie znaleziono serwerów, którymi możesz zarządzać."
        );
      } else {
        setMsg(`✅ Znaleziono ${data.length} serwer(y).`);
      }
    } catch (error) {
      console.error("GUILDS ERROR:", error);
      setMsg("❌ Błąd podczas pobierania serwerów.");
    }
  }

  async function selectGuild(id: string) {
    setGid(id);
    setMsg("");

    if (!id) {
      setChannels([]);
      setRoles([]);
      setCfg(null);
      return;
    }

    try {
      setMsg("Ładowanie konfiguracji serwera...");

      const [channelsRes, rolesRes, configRes] =
        await Promise.all([
          fetch(`/api/guilds/${id}/channels`, {
            cache: "no-store",
          }),
          fetch(`/api/guilds/${id}/roles`, {
            cache: "no-store",
          }),
          fetch(`/api/guilds/${id}/config`, {
            cache: "no-store",
          }),
        ]);

      const channelsData = await channelsRes.json();
      const rolesData = await rolesRes.json();
      const configData = await configRes.json();

      console.log("CHANNELS:", channelsData);
      console.log("ROLES:", rolesData);
      console.log("CONFIG:", configData);

      if (!channelsRes.ok) {
        setMsg(
          "❌ Nie udało się pobrać kanałów: " +
            (channelsData?.error || "Błąd")
        );
        return;
      }

      if (!rolesRes.ok) {
        setMsg(
          "❌ Nie udało się pobrać rang: " +
            (rolesData?.error || "Błąd")
        );
        return;
      }

      if (!configRes.ok) {
        setMsg(
          "❌ Nie udało się pobrać konfiguracji: " +
            (configData?.error || "Błąd")
        );
        return;
      }

      setChannels(Array.isArray(channelsData) ? channelsData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);

      setCfg({
        ...configData,
        access_roles: Array.isArray(configData?.access_roles)
          ? configData.access_roles
          : [],
      });

      setMsg("");
    } catch (error) {
      console.error("SELECT GUILD ERROR:", error);
      setMsg("❌ Nie udało się załadować serwera.");
    }
  }

  function patch(key: string, value: any) {
    setCfg((current: any) => ({
      ...current,
      [key]: value,
    }));
  }

  async function save() {
    if (!gid || !cfg) {
      setMsg("❌ Najpierw wybierz serwer.");
      return;
    }

    try {
      setMsg("Zapisywanie...");

      const r = await fetch(`/api/guilds/${gid}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cfg),
      });

      const j = await r.json();

      if (r.ok) {
        setMsg(
          "✅ Zapisano. Bot odświeży panel automatycznie."
        );
      } else {
        setMsg("❌ " + (j?.error || "Błąd zapisu."));
      }
    } catch (error) {
      console.error("SAVE ERROR:", error);
      setMsg("❌ Wystąpił błąd podczas zapisywania.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  if (!me) {
    return (
      <main className="center">
        <div className="card">Ładowanie...</div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <aside>
        <div className="brand">
          <span>Z</span> ZiomekGT
        </div>

        <nav>
          <a className="active">⚙️ Konfiguracja</a>
          <a>📋 Rekrutacja</a>
          <a>🔐 Uprawnienia</a>
        </nav>

        <button className="logout" onClick={logout}>
          Wyloguj
        </button>
      </aside>

      <section className="content">
        <header>
          <div>
            <small>PANEL ZARZĄDZANIA</small>
            <h1>Konfiguracja</h1>
          </div>

          <div className="user">
            {me.globalName || me.username}
          </div>
        </header>

        <div className="panel top">
          <label>Serwer Discord</label>

          <select
            value={gid}
            onChange={(e) => selectGuild(e.target.value)}
          >
            <option value="">Wybierz serwer</option>

            {guilds.map((guild) => (
              <option value={guild.id} key={guild.id}>
                {guild.name}
              </option>
            ))}
          </select>

          {guilds.length === 0 && (
            <p className="muted">
              Nie znaleziono żadnych serwerów.
            </p>
          )}
        </div>

        {msg && (
          <div className="panel">
            <span>{msg}</span>
          </div>
        )}

        {cfg && (
          <>
            <div className="grid">
              <article className="panel">
                <h2>📍 Panel</h2>

                <label>Kanał</label>

                <select
                  value={cfg.panel_channel_id || ""}
                  onChange={(e) =>
                    patch(
                      "panel_channel_id",
                      e.target.value || null
                    )
                  }
                >
                  <option value="">Wybierz kanał</option>

                  {channels
                    .filter((channel) => channel.type === 0)
                    .map((channel) => (
                      <option
                        value={channel.id}
                        key={channel.id}
                      >
                        # {channel.name}
                      </option>
                    ))}
                </select>

                <label>Tytuł</label>

                <input
                  value={cfg.panel_title || ""}
                  onChange={(e) =>
                    patch("panel_title", e.target.value)
                  }
                />

                <label>Opis</label>

                <textarea
                  value={cfg.panel_description || ""}
                  onChange={(e) =>
                    patch(
                      "panel_description",
                      e.target.value
                    )
                  }
                />

                <label>Stopka</label>

                <input
                  value={cfg.panel_footer || ""}
                  onChange={(e) =>
                    patch("panel_footer", e.target.value)
                  }
                />
              </article>

              <article className="panel">
                <h2>🔐 Prywatne zgłoszenia</h2>

                <p className="muted">
                  Te role dostaną dostęp do kanałów
                  rekrutacyjnych.
                </p>

                <div className="roles">
                  {roles
                    .filter((role) => role.name !== "@everyone")
                    .map((role) => {
                      const accessRoles =
                        cfg.access_roles || [];

                      return (
                        <label key={role.id}>
                          <input
                            type="checkbox"
                            checked={accessRoles.includes(
                              role.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                patch(
                                  "access_roles",
                                  Array.from(
                                    new Set([
                                      ...accessRoles,
                                      role.id,
                                    ])
                                  )
                                );
                              } else {
                                patch(
                                  "access_roles",
                                  accessRoles.filter(
                                    (x: string) =>
                                      x !== role.id
                                  )
                                );
                              }
                            }}
                          />

                          {role.name}
                        </label>
                      );
                    })}
                </div>
              </article>
            </div>

            <article className="panel">
              <h2>🎯 Rangi i wymagania</h2>

              <div className="roleGrid">
                {[
                  ["ticket", "🎫"],
                  ["helper", "🛠️"],
                  ["admin", "🛡️"],
                  ["cowowner", "👑"],
                ].map(([key, emoji]) => (
                  <div className="role" key={key}>
                    <b>
                      {emoji} {cfg[key + "_name"]}
                    </b>

                    <label>
                      <input
                        type="checkbox"
                        checked={
                          !!cfg[key + "_enabled"]
                        }
                        onChange={(e) =>
                          patch(
                            key + "_enabled",
                            e.target.checked
                          )
                        }
                      />

                      Włączona
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={
                          !!cfg[key + "_email"]
                        }
                        onChange={(e) =>
                          patch(
                            key + "_email",
                            e.target.checked
                          )
                        }
                      />

                      Email
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={
                          !!cfg[key + "_over13"]
                        }
                        onChange={(e) =>
                          patch(
                            key + "_over13",
                            e.target.checked
                          )
                        }
                      />

                      Powyżej 13 lat
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={
                          !!cfg[key + "_voice"]
                        }
                        onChange={(e) =>
                          patch(
                            key + "_voice",
                            e.target.checked
                          )
                        }
                      />

                      Mutacja głosu
                    </label>

                    <input
                      value={cfg[key + "_name"] || ""}
                      onChange={(e) =>
                        patch(
                          key + "_name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </article>

            <div className="saveRow">
              <button className="save" onClick={save}>
                💾 Zapisz konfigurację
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}