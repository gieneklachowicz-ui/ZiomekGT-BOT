import os
import re
import asyncio
from datetime import datetime

import discord
from discord import app_commands
from discord.ext import commands, tasks
from dotenv import load_dotenv
from upstash_redis import Redis

load_dotenv()
TOKEN=os.getenv("DISCORD_TOKEN")
if not TOKEN: raise RuntimeError("Brak DISCORD_TOKEN w .env")

try:
    redis=Redis.from_env()
except Exception as e:
    raise RuntimeError("Brak UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN w .env") from e

DEFAULTS={
    "panel_title":"REKRUTACJA",
    "panel_description":"Jeśli chcesz iść na rangę administratora, musisz wypełnić te rzeczy ⬇️",
    "panel_footer":"ZiomekGT • Rekrutacja",
    "panel_channel_id":None,"panel_message_id":None,
    "ticket_enabled":True,"helper_enabled":True,"admin_enabled":True,"cowowner_enabled":True,
    "ticket_email":False,"helper_email":False,"admin_email":True,"cowowner_email":True,
    "ticket_over13":True,"helper_over13":True,"admin_over13":True,"cowowner_over13":True,
    "ticket_voice":True,"helper_voice":True,"admin_voice":True,"cowowner_voice":True,
    "ticket_name":"Ticket","helper_name":"Helper","admin_name":"Administrator","cowowner_name":"Co-Owner"
}

def ckey(gid): return f"ziomekgt:config:{gid}"
def rkey(gid): return f"ziomekgt:roles:{gid}"
def akey(gid): return f"ziomekgt:applications:{gid}"

def get_cfg(gid):
    x=redis.get(ckey(gid)) or {}
    d=DEFAULTS.copy(); d.update(x); return d

def save_cfg(gid,cfg): redis.set(ckey(gid),cfg)
def access_roles(gid): return [str(x) for x in (redis.smembers(rkey(gid)) or [])]
def setting(gid,key): return get_cfg(gid).get(key,DEFAULTS.get(key))
def requirements(gid,key):
    return {"email":bool(setting(gid,f"{key}_email")),"over13":bool(setting(gid,f"{key}_over13")),"voice":bool(setting(gid,f"{key}_voice"))}
def role_enabled(gid,key): return bool(setting(gid,f"{key}_enabled"))
def role_name(gid,key): return setting(gid,f"{key}_name") or key

def add_application(gid,data):
    arr=redis.get(akey(gid)) or []
    arr.append(data); redis.set(akey(gid),arr)

intents=discord.Intents.default(); intents.guilds=True; intents.members=True
bot=commands.Bot(command_prefix="!",intents=intents)

async def can_access(member):
    if member.guild_permissions.administrator:return True
    allowed=set(access_roles(member.guild.id)); return any(str(r.id) in allowed for r in member.roles)

async def build_panel(guild):
    cfg=get_cfg(guild.id); channel_id=cfg.get("panel_channel_id")
    if not channel_id:return
    channel=guild.get_channel(int(channel_id))
    if not channel:return
    options=[]
    for key,emoji in [("ticket","🎫"),("helper","🛠️"),("admin","🛡️"),("cowowner","👑")]:
        if role_enabled(guild.id,key): options.append(discord.SelectOption(label=role_name(guild.id,key),value=key,emoji=emoji))
    if not options:return
    embed=discord.Embed(title=cfg["panel_title"],description=cfg["panel_description"],color=discord.Color.blurple())
    embed.set_footer(text=cfg["panel_footer"])
    view=RecruitmentView(guild.id)
    message=None
    if cfg.get("panel_message_id"):
        try: message=await channel.fetch_message(int(cfg["panel_message_id"]))
        except discord.HTTPException: pass
    try:
        if message: await message.edit(embed=embed,view=view)
        else:
            message=await channel.send(embed=embed,view=view); cfg["panel_message_id"]=message.id; save_cfg(guild.id,cfg)
    except discord.HTTPException as e: print("Panel sync:",e)

class RoleSelect(discord.ui.Select):
    def __init__(self,gid):
        options=[]
        for key,emoji in [("ticket","🎫"),("helper","🛠️"),("admin","🛡️"),("cowowner","👑")]:
            if role_enabled(gid,key): options.append(discord.SelectOption(label=role_name(gid,key),value=key,emoji=emoji))
        super().__init__(placeholder="Wybierz rangę...",min_values=1,max_values=1,options=options,custom_id=f"ziomekgt:role:{gid}")
    async def callback(self,interaction): await interaction.response.send_modal(ApplicationModal(self.values[0]))

class RecruitmentView(discord.ui.View):
    def __init__(self,gid): super().__init__(timeout=None); self.add_item(RoleSelect(gid))

class ApplicationModal(discord.ui.Modal):
    def __init__(self,key):
        self.key=key; super().__init__(title="Formularz rekrutacyjny")
        self.email=discord.ui.TextInput(label="Email (jeśli wymagany)",placeholder="twoj@email.com",required=False,max_length=254)
        self.reason=discord.ui.TextInput(label="Po co chcesz tę rangę?",style=discord.TextStyle.paragraph,required=True,max_length=1000)
        self.why=discord.ui.TextInput(label="Dlaczego mielibyśmy Cię wybrać?",style=discord.TextStyle.paragraph,required=True,max_length=1000)
        self.over13=discord.ui.TextInput(label="Czy masz powyżej 13 lat? Tak/Nie",required=False,max_length=3)
        self.voice=discord.ui.TextInput(label="Czy przeszedłeś mutację głosu? Tak/Nie",required=False,max_length=3)
        for x in (self.email,self.reason,self.why,self.over13,self.voice): self.add_item(x)
    async def on_submit(self,interaction):
        req=requirements(interaction.guild.id,self.key); email=self.email.value.strip() or None
        if req["email"] and (not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$",email)):
            await interaction.response.send_message("❌ Podaj poprawny adres email.",ephemeral=True); return
        if not req["email"]: email=None
        over13=self.over13.value.strip() if req["over13"] else "Nie dotyczy"
        voice=self.voice.value.strip() if req["voice"] else "Nie dotyczy"
        await interaction.response.defer(ephemeral=True)
        category=discord.utils.get(interaction.guild.categories,name="REKRUTACJA")
        if not category: category=await interaction.guild.create_category("REKRUTACJA")
        app_id=f"{interaction.user.id}-{int(datetime.now().timestamp())}"
        overwrites={interaction.guild.default_role:discord.PermissionOverwrite(view_channel=False),interaction.guild.me:discord.PermissionOverwrite(view_channel=True,send_messages=True,read_message_history=True,manage_channels=True),interaction.user:discord.PermissionOverwrite(view_channel=True,send_messages=True,read_message_history=True)}
        for rid in access_roles(interaction.guild.id):
            role=interaction.guild.get_role(int(rid))
            if role: overwrites[role]=discord.PermissionOverwrite(view_channel=True,send_messages=True,read_message_history=True)
        n=re.sub(r"[^a-zA-Z0-9-]","-",interaction.user.name.lower())[:35]
        try: ch=await interaction.guild.create_text_channel(f"rekrutacja-{n}-{app_id[-8:]}",category=category,overwrites=overwrites)
        except discord.Forbidden:
            await interaction.followup.send("❌ Bot nie ma Manage Channels.",ephemeral=True); return
        embed=discord.Embed(title=f"📋 Zgłoszenie • {role_name(interaction.guild.id,self.key)}",description=f"Użytkownik: {interaction.user.mention}",color=discord.Color.blurple())
        embed.add_field(name="🔞 Powyżej 13 lat",value=over13,inline=True); embed.add_field(name="🎙️ Mutacja głosu",value=voice,inline=True)
        if email: embed.add_field(name="📧 Email",value=email,inline=False)
        embed.add_field(name="📝 Po co?",value=self.reason.value.strip(),inline=False); embed.add_field(name="⭐ Dlaczego Ty?",value=self.why.value.strip(),inline=False)
        embed.set_footer(text=setting(interaction.guild.id,"panel_footer"))
        await ch.send(interaction.user.mention,embed=embed,view=ApplicationActions())
        add_application(interaction.guild.id,{"id":app_id,"user_id":interaction.user.id,"username":str(interaction.user),"requested_role":self.key,"email":email,"reason":self.reason.value.strip(),"why_me":self.why.value.strip(),"over_13":over13,"voice_mutation":voice,"channel_id":ch.id,"status":"pending","created_at":datetime.now().isoformat(timespec="seconds")})
        await interaction.followup.send(f"✅ Zgłoszenie utworzone: {ch.mention}",ephemeral=True)

class ApplicationActions(discord.ui.View):
    def __init__(self): super().__init__(timeout=None)
    @discord.ui.button(label="Zamknij",style=discord.ButtonStyle.danger,emoji="🔒",custom_id="ziomekgt:close")
    async def close(self,interaction,button):
        if not await can_access(interaction.user): await interaction.response.send_message("❌ Nie masz dostępu.",ephemeral=True); return
        await interaction.response.send_message("🔒 Kanał zostanie usunięty za 5 sekund."); await asyncio.sleep(5)
        try: await interaction.channel.delete()
        except discord.HTTPException: pass

@bot.tree.command(name="ustaw-rekrutacje",description="Ustaw kanał panelu rekrutacyjnego.")
@app_commands.describe(kanal="Kanał")
@app_commands.default_permissions(administrator=True)
async def setup(interaction,kanal:discord.TextChannel):
    if not interaction.user.guild_permissions.administrator: await interaction.response.send_message("❌ Brak uprawnień.",ephemeral=True); return
    cfg=get_cfg(interaction.guild.id); cfg["panel_channel_id"]=kanal.id; cfg["panel_message_id"]=None; save_cfg(interaction.guild.id,cfg)
    await build_panel(interaction.guild); await interaction.response.send_message(f"✅ Panel ustawiony na {kanal.mention}.",ephemeral=True)

@tasks.loop(seconds=8)
async def sync_config():
    for g in bot.guilds:
        try: await build_panel(g)
        except Exception as e: print(f"Sync {g.id}:",e)

@bot.event
async def on_ready():
    for g in bot.guilds:
        if not redis.exists(ckey(g.id)): save_cfg(g.id,DEFAULTS.copy())
        try: bot.add_view(RecruitmentView(g.id))
        except Exception as e: print("View:",e)
    bot.add_view(ApplicationActions())
    try: await bot.tree.sync()
    except Exception as e: print("Sync commands:",e)
    if not sync_config.is_running(): sync_config.start()
    print(f"ZiomekGT online: {bot.user}")

@bot.event
async def on_guild_join(guild):
    if not redis.exists(ckey(guild.id)): save_cfg(guild.id,DEFAULTS.copy())

bot.run(TOKEN)
