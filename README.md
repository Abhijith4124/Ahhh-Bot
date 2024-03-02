
![Logo](https://i.ibb.co/6gSFd5t/20240211-161451.png)


# Ahhh Bot - Palworld Discord Bot | Whitelist | Join/Leave Messages | Automatic Roles and Announcement
[![AddBotToServer](https://raw.githubusercontent.com/Abhijith4124/SomeSvgImages/main/discord_add_to_server.svg?sanitized=true)](https://discord.com/api/oauth2/authorize?client_id=1205567259985190986&permissions=275146344448&scope=bot)

AhhhBot is designed to enhance your Palworld gaming experience by allowing you to manage your Palworld Game Server directly through Discord. With a range of features including whitelisting, in-game join/leave messages, player management (ban, kick), and broadcast messaging capabilities, this bot streamlines server administration and communication for Palworld players.


## Features

- Whitelisting: Control access to your Palworld Game Server by managing whitelisted players directly from Discord.
- Player Spoofing Prevention: Prevent hackers from pretending to be another player on your server.
- Advanced Whitelisting: Whitelist Players on your server using thier SteamId, PlayerUid and even thier In Game Name to prevent any spoofing.
- In-Game Join/Leave Messages: Keep track of player activity with automatic announcements when players join or leave your Palworld server.
- Server Status Channel: Ability to setup a Server Status channel and the bot will automatically display the Current Server Status, Online Players, Max Player Count, Peak Player Count and a Player list.
- Discord Game Log Channel: Ability to setup a Game Log channel for the bot to post Game Server logs like Player Join/Leave, Non Whitelisted Player being kicked, Player Whitelisted, etc.
- Automatic Whitelist Announcement: The bot will automatically announce in the channel specified when a user has been whitelisted.
- Automatic Discord Whitelist Role: Set the Role Id to be provided to the user when they are whitelisted.
- Player Management: Easily ban or kick players from your Palworld Game Server using Discord commands.
- Broadcast Messages: Send messages directly to your Palworld server for all players to see, facilitating server-wide communication.
- PlayerUID and Steam ID Whitelisting: Support for both PlayerUID and Steam ID whitelisting, offering flexibility in player identification and management.

## Screenshots
![Welcome](https://i.ibb.co/1Jbnd3L/welcome.png)
## Commands

### Server Configuration
- `/serverconfig`: Displays options to configure your Palworld Server within the Discord Server.
  - **Configuration Options:**
    - **Gamelog Channel:** Set a channel to receive game logs such as player join/leave events.
    - **Status Channel:** Set a channel for server status updates.
    - **Whitelist Announcement Channel:** Set a channel for whitelist announcements.
    - **Whitelist Log Channel:** Set a channel for whitelist logs.
    - **Whitelist Role:** Assign a role to whitelisted users.

### Managing Palworld Servers
- `/addpalserver`: Add a Palworld Server by providing server details.
- `/listpalservers`: View the list of added Palworld Servers.
- `/removepalserver [server]`: Remove a previously added Palworld Server.

### Whitelisting Players
- `/whitelist [server] [enabled]`: Enable or disable whitelist for a Palworld Server.
- `/addwhitelist [server] [steamid] [playeruid] [discorduser]`: Add a player to the whitelist. Optionally, mention the Discord user for role assignment and announcement.
- `/removewhitelist [server] [playername] [discorduser]`: Remove a player from the whitelist. Optionally, mention discord user to remove associated Discord roles.
- -`/linkwhitelist [server] [playername] [discorduser]`: Links a Game Player to a Discord User, granting them Whitelist roles and Welcome message if specified.
- -`/unlinkwhitelist [server] [playername]`: Unlinks a Game Player from a Discord User, removes thier Whitelist roles if specified.

### Miscellaneous Commands
- `/save`: Save the current Palworld game state.
- `/broadcast [server] [message]`: Send a message to players on the Palworld Server.
- `/banplayer [server] [playersteamid]`: Ban a player by their Steam ID.
- `/kickplayer [server] [playersteamid]`: Kick a player by their Steam ID.

### UI Options
##
![Server Configuration](https://i.ibb.co/Jt3RJt5/server-config.png)
- Configure Server Using the UI

##
![Whitelist UI](https://i.ibb.co/qJcksh8/whitelist.png)
- Whitelist Player Straight from the log

##
![Spoof Detection](https://i.ibb.co/V2PRVSC/spoof-prevention.pngg)
- Ban Detected Players Instantly with just a click!


## ENV File
(Skip if you are using Docker)
Create a .env File in the root directory.

```
DEBUG=false
TOKEN=
BOT_APPLICATION_ID=
CUSTOM_STATUS_MESSAGE=
STATUS_UPDATE_INTERVAL=10000
SERVER_POLLING_INTERVAL=5000
```
STATUS_UPDATE_INTERVAL: Interval for Updating Status Message in Discord.

SERVER_POLLING_INTERVAL: Interval for polling the PalWorld Game Server to fetch new data.


## Installation and Deployment

### Docker Method
Run a Docker Container using:

```
docker container run \
    --name ahhhbot \
    -d \
    -v <host_data_directory>:/app/data \
    -e DEBUG=false \
    -e TOKEN=<bot_token> \
    -e BOT_APPLICATION_ID=<bot_application_id> \
    -e CUSTOM_STATUS_MESSAGE="<custom_status_message>" \
    -e STATUS_UPDATE_INTERVAL=10000 \
    -e SERVER_POLLING_INTERVAL=5000 \
    abhijith4124/ahhhbot:latest

```
Replace the values in <> with your own values.

### Manual Method

Clone the repo or Download the Source as Zip.

Install the NPM Packages using:

```bash
  npm install
```

To run the Discord bot just start it using NodeJs:
```
node index.js
```

If you are deploying the bot on a server or hosting it locally, I would recommend using pm2 to start the node project.

Install PM2 if not installed already:
```
npm install pm2 -g
```

Start the Bot using:
```
pm2 start index.js
```

## Roadmap

- Easier Server Management Using UI within discord itself.

- Player lists and player history tracking


## Tech Stack

**Server:** NodeJS 20.11.0 LTS


## License

[MIT](https://choosealicense.com/licenses/mit/)

