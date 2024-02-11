
![Logo](https://i.ibb.co/6gSFd5t/20240211-161451.png)


# Ahhh Bot - Palworld Discord Bot | Whitelist | Join/Leave Messages | Automatic Roles and Announcement

AhhhBot is designed to enhance your Palworld gaming experience by allowing you to manage your Palworld Game Server directly through Discord. With a range of features including whitelisting, in-game join/leave messages, player management (ban, kick), and broadcast messaging capabilities, this bot streamlines server administration and communication for Palworld players.


## Features

- Whitelisting: Control access to your Palworld Game Server by managing whitelisted players directly from Discord.
- In-Game Join/Leave Messages: Keep track of player activity with automatic announcements when players join or leave your Palworld server.
- Server Status Channel: Ability to setup a Server Status channel and the bot will automatically display the Current Server Status, Online Players, Max Player Count, Peak Player Count and a Player list.
- Discord Game Log Channel: Ability to setup a Game Log channel for the bot to post Game Server logs like Player Join/Leave, Non Whitelisted Player being kicked, Player Whitelisted, etc.
- Automatic Whitelist Announcement: The bot will automatically announce in the channel specified when a user has been whitelisted.
- Automatic Discord Whitelist Role: Set the Role Id to be provided to the user when they are whitelisted.
- Player Management: Easily ban or kick players from your Palworld Game Server using Discord commands.
- Broadcast Messages: Send messages directly to your Palworld server for all players to see, facilitating server-wide communication.
- PlayerUID and Steam ID Whitelisting: Support for both PlayerUID and Steam ID whitelisting, offering flexibility in player identification and management.
## Commands

### Server Configuration
- `/serverconfig`: Displays options to configure your Palworld Server within the Discord Server.
  - **Configuration Options:**
    - **Gamelog Channel:** Set a channel to receive game logs such as player join/leave events.
    - **Status Channel:** Set a channel for server status updates.
    - **Whitelist Announcement Channel:** Set a channel for whitelist announcements.
    - **Whitelist Role:** Assign a role to whitelisted users.

### Managing Palworld Servers
- `/addpalserver`: Add a Palworld Server by providing server details.
- `/listpalservers`: View the list of added Palworld Servers.
- `/removepalserver [server]`: Remove a previously added Palworld Server.

### Whitelisting Players
- `/whitelist [server] [enabled]`: Enable or disable whitelist for a Palworld Server.
- `/addwhitelist [server] [steamid] [playeruid] [discorduser]`: Add a player to the whitelist. Optionally, mention the Discord user for role assignment and announcement.
- `/removewhitelist [server] [steamid] [playeruid] [discorduser]`: Remove a player from the whitelist. Optionally, mention discord user to remove associated Discord roles.

### Miscellaneous Commands
- `/save`: Save the current Palworld game state.
- `/broadcast [server] [message]`: Send a message to players on the Palworld Server.
- `/banplayer [server] [playersteamid]`: Ban a player by their Steam ID.
- `/kickplayer [server] [playersteamid]`: Kick a player by their Steam ID.



## Config File
Edit the config.json file in the root directory

```
{
  "token": "your_discord_bot_token",
  "botApplicationId": "your_bot_id"
}
```



## Installation and Deployment

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

