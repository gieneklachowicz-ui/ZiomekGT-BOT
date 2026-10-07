import os
import re
import sqlite3
import asyncio
from datetime import datetime, timedelta

import discord
from discord import app_commands
from discord.ext import commands, tasks
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
DB_FILE = os.getenv("DATABASE_FILE", "../ziomekgt.db")

if not TOKEN:
    raise RuntimeError("Brak DISCORD_TOKEN w .env")

intents = discord.Intents.default()
intents.guilds = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

DEFAULTS = {
    "panel_title": "REKRUTACJA",
    "panel_description": "Jeśli chcesz iść na rangę administratora, musisz wypełnić te rzeczy ⬇️",
    "panel_footer": "ZiomekGT • Rekrutacja",
    "ticket_enabled": "1", "helper_enabled": "1", "admin_enabled": "1", "cowowner_enabled": "1",
    "ticket_email": "0", "helper_email": "0", "admin_email": "1", "cowowner_email": "1",
    "ticket_over13": "1", "helper_over13": "1", "admin_over13": "1", "cowowner_over13": "1",
    "ticket_voice": "1", "helper_voice": "1", "admin_voice": "1", "cowowner_voice": "1",
    "ticket_name": "Ticket", "helper_name": "Helper", "admin_name": "Administrator", "cowowner_name": "Co-Owner",
}

def db():
    c = sqlite3.connect(DB_FILE)
    c.row_factory = sqlite3.Row
    return c

def init_db():
    c = db()
    c.execute("""CREATE TABLE IF NOT EXISTS guild_config(
        guild_id INTEGER PRIMARY KEY,
        panel_channel_id INTEGER,
        panel_message_id INTEGER
    )""")
    c.execute("""CREATE TABLE IF NOT EXISTS settings(
        guild_id INTEGER, key TEXT, value TEXT,
        PRIMARY KEY(guild_id,key)
    )""")
    c.execute("""CREATE TABLE IF NOT EXISTS access_roles(
        guild_id INTEGER, role_id INTEGER,
        PRIMARY KEY(guild_id,role_id)
    )""")
    c.execute("""CREATE TABLE IF NOT EXISTS applications(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
        username TEXT NOT NULL, requested_role TEXT NOT NULL,
        email TEXT, reason TEXT NOT NULL, why_me TEXT NOT NULL,
        over_13 TEXT NOT NULL, voice_mutation TEXT NOT NULL,
        channel_id INTEGER, status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL
    )""")
    for g in bot.guilds:
        ensure_defaults(c, g.id)
    c.commit()
    c.close()

def ensure_defaults(c, gid):
    for k,v in DEFAULTS.items():
        c.execute("INSERT OR IGNORE INTO settings(guild_id,key,value) VALUES(?,?,?)",(gid,k,v))

def setting(gid,key):
    c=db(); r=c.execute("SELECT value FROM settings WHERE guild_id=? AND key=?",(gid,key)).fetchone(); c.close()
    return r["value"] if r else DEFAULTS.get(key)

def set_setting(gid,key,value):
    c=db(); ensure_defaults(c,gid)
    c.execute("""INSERT INTO settings(guild_id,key,value) VALUES(?,?,?)
                 ON CONFLICT(guild_id,key) DO UPDATE SET value=excluded.value""",(gid,key,str(value)))
    c.commit(); c.close()

def access_roles(gid):
    c=db(); rows=c.execute("SELECT role_id FROM access_roles WHERE guild_id=?",(gid,)).fetchall(); c.close()
    return [r["role_id"] for r in rows]

def requirements(gid,key):
    return {
        "email": setting(gid,f"{key}_email") == "1",
        "over13": setting(gid,f"{key}_over13") == "1",
        "voice": setting(gid,f"{key}_voice") == "1",
    }

def role_enabled(gid,key):
    return setting(gid,f"{key}_enabled") == "1"

def role_name(gid,key):
    return setting(gid,f"{key}_name") or key

async def can_access(member):
    if member.guild_permissions.administrator:
        return True
    allowed=access_roles(member.guild.id)
    return any(r.id in allowed for r in member.roles)

async def build_panel(guild):
    c=db()
    row=c.execute("SELECT panel_channel_id,panel_message_id FROM guild_config WHERE guild_id=?",(guild.id,)).fetchone()
    c.close()
    if not row or not row["panel_channel_id"]:
        return
    channel=guild.get_channel(row["panel_channel_id"])
    if not channel:
        return
    options=[]
    for key,emoji in [("ticket","🎫"),("helper","🛠️"),("admin","🛡️"),("cowowner","👑")]:
        if role_enabled(guild.id,key):
            options.append(discord.SelectOption(label=role_name(guild.id,key),value=key,emoji=emoji))
    if not options:
        return
    embed=discord.Embed(title=setting(guild.id,"panel_title"),description=setting(guild.id,"panel_description"),color=discord.Color.blurple())
    embed.set_footer(text=setting(guild.id,"panel_footer"))
    view=RecruitmentView(guild.id)
    message=None
    if row["panel_message_id"]:
        try:
            message=await channel.fetch_message(row["panel_message_id"])
        except discord.HTTPException:
            message=None
    try:
        if message:
            await message.edit(embed=embed,view=view)
        else:
            message=await channel.send(embed=embed,view=view)
            c=db(); c.execute("UPDATE guild_config SET panel_message_id=? WHERE guild_id=?",(message.id,guild.id)); c.commit(); c.close()
    except discord.HTTPException as e:
        print("Panel sync:",e)

class RoleSelect(discord.ui.Select):
    def __init__(self,gid):
        options=[]
        for key,emoji in [("ticket","🎫"),("helper","🛠️"),("admin","🛡️"),("cowowner","👑")]:
            if role_enabled(gid,key):
                options.append(discord.SelectOption(label=role_name(gid,key),value=key,emoji=emoji))
        super().__init__(placeholder="Wybierz rangę...",min_values=1,max_values=1,options=options,custom_id=f"ziomekgt:role:{gid}")
    async def callback(self,interaction):
        await interaction.response.send_modal(ApplicationModal(self.values[0]))

class RecruitmentView(discord.ui.View):
    def __init__(self,gid):
        super().__init__(timeout=None)
        self.add_item(RoleSelect(gid))

class ApplicationModal(discord.ui.Modal):
    def __init__(self,key):
        self.key=key
        super().__init__(title="Formularz rekrutacyjny")
        self.email=discord.ui.TextInput(label="Email (jeśli wymagany)",placeholder="twoj@email.com",required=False,max_length=254)
        self.reason=discord.ui.TextInput(label="Po co chcesz tę rangę?",style=discord.TextStyle.paragraph,required=True,max_length=1000)
        self.why=discord.ui.TextInput(label="Dlaczego mielibyśmy Cię wybrać?",style=discord.TextStyle.paragraph,required=True,max_length=1000)
        self.over13=discord.ui.TextInput(label="Czy masz powyżej 13 lat? Tak/Nie",required=False,max_length=3)
        self.voice=discord.ui.TextInput(label="Czy przeszedłeś mutację głosu? Tak/Nie",required=False,max_length=3)
        for x in (self.email,self.reason,self.why,self.over13,self.voice): self.add_item(x)

    async def on_submit(self,interaction):
        req=requirements(interaction.guild.id,self.key)
        email=self.email.value.strip() or None
        if req["email"]:
            if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$",email):
                await interaction.response.send_message("❌ Podaj poprawny adres email.",ephemeral=True); return
        else: email=None
        over13=self.over13.value.strip() if req["over13"] else "Nie dotyczy"
        voice=self.voice.value.strip() if req["voice"] else "Nie dotyczy"
        c=db()
        cur=c.execute("""INSERT INTO applications
        (guild_id,user_id,username,requested_role,email,reason,why_me,over_13,voice_mutation,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?)""",(interaction.guild.id,interaction.user.id,str(interaction.user),self.key,email,
        self.reason.value.strip(),self.why.value.strip(),over13,voice,datetime.now().isoformat(timespec="seconds")))
        app_id=cur.lastrowid;c.commit();c.close()
        await interaction.response.defer(ephemeral=True)
        category=discord.utils.get(interaction.guild.categories,name="REKRUTACJA")
        if not category: category=await interaction.guild.create_category("REKRUTACJA")
        overwrites={interaction.guild.default_role:discord.PermissionOverwrite(view_channel=False),
                    interaction.guild.me:discord.PermissionOverwrite(view_channel=True,send_messages=True,read_message_history=True,manage_channels=True),
                    interaction.user:discord.PermissionOverwrite(view_channel=True,send_messages=True,read_message_history=True)}
        for rid in access_roles(interaction.guild.id):
            role=interaction.guild.get_role(rid)
            if role: overwrites[role]=discord.PermissionOverwrite(view_channel=True,send_messages=True,read_message_history=True)
        n=re.sub(r"[^a-zA-Z0-9-]","-",interaction.user.name.lower())[:35]
        try:
            ch=await interaction.guild.create_text_channel(f"rekrutacja-{n}-{app_id}",category=category,overwrites=overwrites)
        except discord.Forbidden:
            await interaction.followup.send("❌ Bot nie ma Manage Channels.",ephemeral=True);return
        embed=discord.Embed(title=f"📋 Zgłoszenie #{app_id}",description=f"Ranga: **{role_name(interaction.guild.id,self.key)}**",color=discord.Color.blurple())
        embed.add_field(name="👤 Użytkownik",value=f"{interaction.user.mention}\n`{interaction.user}`",inline=True)
        embed.add_field(name="🔞 Powyżej 13 lat",value=over13,inline=True)
        embed.add_field(name="🎙️ Mutacja głosu",value=voice,inline=True)
        if email: embed.add_field(name="📧 Email",value=email,inline=False)
        embed.add_field(name="📝 Po co?",value=self.reason.value.strip(),inline=False)
        embed.add_field(name="⭐ Dlaczego Ty?",value=self.why.value.strip(),inline=False)
        embed.set_footer(text=setting(interaction.guild.id,"panel_footer"))
        await ch.send(interaction.user.mention,embed=embed,view=ApplicationActions())
        c=db();c.execute("UPDATE applications SET channel_id=? WHERE id=?",(ch.id,app_id));c.commit();c.close()
        await interaction.followup.send(f"✅ Zgłoszenie **#{app_id}** utworzone: {ch.mention}",ephemeral=True)

class ApplicationActions(discord.ui.View):
    def __init__(self): super().__init__(timeout=None)
    @discord.ui.button(label="Zamknij",style=discord.ButtonStyle.danger,emoji="🔒",custom_id="ziomekgt:close")
    async def close(self,interaction,button):
        if not await can_access(interaction.user):
            await interaction.response.send_message("❌ Nie masz dostępu.",ephemeral=True);return
        await interaction.response.send_message("🔒 Kanał zostanie usunięty za 5 sekund.")
        await asyncio.sleep(5)
        try: await interaction.channel.delete()
        except discord.HTTPException: pass

@bot.tree.command(name="ustaw-rekrutacje",description="Ustaw kanał panelu rekrutacyjnego.")
@app_commands.describe(kanal="Kanał")
@app_commands.default_permissions(administrator=True)
async def setup(interaction,kanal:discord.TextChannel):
    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message("❌ Brak uprawnień.",ephemeral=True);return
    c=db();ensure_defaults(c,interaction.guild.id)
    c.execute("""INSERT INTO guild_config(guild_id,panel_channel_id,panel_message_id)
                 VALUES(?,?,NULL) ON CONFLICT(guild_id) DO UPDATE SET panel_channel_id=excluded.panel_channel_id,panel_message_id=NULL""",
              (interaction.guild.id,kanal.id));c.commit();c.close()
    await build_panel(interaction.guild)
    await interaction.response.send_message(f"✅ Panel ustawiony na {kanal.mention}.",ephemeral=True)

@tasks.loop(seconds=8)
async def sync_config():
    for g in bot.guilds:
        try: await build_panel(g)
        except Exception as e: print(f"Sync {g.id}:",e)

@bot.event
async def on_ready():
    init_db()
    bot.add_view(ApplicationActions())
    for g in bot.guilds:
        try: bot.add_view(RecruitmentView(g.id))
        except Exception as e: print(e)
    try: await bot.tree.sync()
    except Exception as e: print("Sync commands:",e)
    if not sync_config.is_running(): sync_config.start()
    print(f"ZiomekGT online: {bot.user}")

@bot.event
async def on_guild_join(guild):
    c=db();ensure_defaults(c,guild.id);c.commit();c.close()

init_db()
bot.run(TOKEN)
