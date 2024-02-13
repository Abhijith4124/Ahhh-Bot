const {EmbedBuilder} = require("discord.js");
const {getServerPlayersInfo, kickPlayer, broadcastMessage} = require("../utils/palworld/palworldRCONWrapper");
const {logToGameLogChannel, logToWhitelistLogChannel} = require("../utils/discord/logger");

const config = require("../config.json");

let firstRun = true;

async function startRCONService(client, db) {
    console.log(`Started RCON Service...`)

    //Populate Server Data on the First Run
    if (firstRun) {
        firstRun = false;
        if (config.debug) {
            console.log(`[RCON Service]: First Run...`)
        }

        let palServers = db.get("PalServers");

        if (!palServers || palServers.length < 1) {
            if (config.debug) {
                console.log(`[RCON Service]: No PalServers Added for First Run. Skipping...`)
            }
            return;
        }

        for (const palServersKey of palServers) {
            const palServerKeySplit = palServersKey.split("_");

            let guildId = palServerKeySplit[0];

            let guildPalServersKey = `${guildId}_PalServers`;
            let guildPalServers = db.get(guildPalServersKey);

            //Looping through each Server added in a Guild aka Server
            for (const guildPalServer of guildPalServers) {
                let serverName = guildPalServer.serverName;
                let host = guildPalServer.host;
                let RCONPort = guildPalServer.RCONPort;
                let password = guildPalServer.password;

                let defaultServerData = {
                    online: false,
                    currentPlayers: 0,
                    maximumPlayers: 32,
                    peakPlayers: 0,
                    playerList: []
                }

                const serverDataKey = `${guildId}_${serverName.replaceAll(" ", "_")}_ServerData`;
                let serverData = db.get(serverDataKey);

                if (!serverData) {
                    serverData = defaultServerData;
                }

                let serverPlayersInfoResponse = await getServerPlayersInfo(host, RCONPort, password);

                if (serverPlayersInfoResponse.status === "success") {
                    serverData.online = true;
                    serverData.currentPlayers = serverPlayersInfoResponse.data.playerList.length;
                    serverData.peakPlayers = serverData.currentPlayers > serverData.peakPlayers ? serverData.currentPlayers : serverData.peakPlayers;
                    serverData.playerList = serverPlayersInfoResponse.data.playerList.filter(player => player.playeruid !== "00000000");

                    if (serverData.currentPlayers > serverData.maximumPlayers) {
                        serverData.maximumPlayers = serverData.currentPlayers
                    }
                } else {
                    if (config.debug) {
                        console.log(`[RCON Service]: Server ${serverName} is Offline during First Run. Setting Default Server Data...`);
                    }
                    serverData = defaultServerData;
                    db.set(serverDataKey, serverData);
                    return;
                }

                db.set(serverDataKey, serverData);
            }
        }
    }

    //Status Message
    setInterval(async () => {
        try {
            if (config.debug) {
                console.log(`[RCON Service]: Updating Status...`)
            }

            let palServers = db.get("PalServers");

            if (!palServers || palServers.length < 1) {
                if (config.debug) {
                    console.log(`[RCON Service]: Not Updating any Status since no servers are added...`)
                }
                return;
            }

            //Looping through each guild aka Server
            for (const palServersKey of palServers) {
                const palServerKeySplit = palServersKey.split("_");
                let guildId = palServerKeySplit[0];

                let guildPalServersKey = `${guildId}_PalServers`;
                let guildPalServers = db.get(guildPalServersKey);

                //Looping through each Server added in a Guild aka Server
                for (const guildPalServer of guildPalServers) {
                    let serverName = guildPalServer.serverName;
                    let host = guildPalServer.host;
                    let port = guildPalServer.port;

                    let statusChannelKey = `${guildId}_${serverName.replaceAll(" ", "_")}_StatusChannelId`;
                    const statusChannelId = db.get(statusChannelKey);

                    if (!statusChannelId) {
                        if (config.debug) {
                            console.log(`[RCON Service]: No Status Channel Set for Server ${serverName}  so skipping...`);
                        }
                        return;
                    }

                    let defaultServerData = {
                        online: false,
                        currentPlayers: 0,
                        maximumPlayers: 32,
                        peakPlayers: 0,
                        playerList: []
                    }

                    const serverDataKey = `${guildId}_${serverName.replaceAll(" ", "_")}_ServerData`;
                    let serverData = db.get(serverDataKey);

                    if (!serverData) {
                        serverData = defaultServerData;
                    }

                    db.set(serverDataKey, serverData);

                    const whitelistEnabledKey = `${guildId}_${serverName.replaceAll(" ", "_")}_PalServerWhitelistEnabled`;
                    let whitelistEnabled = db.get(whitelistEnabledKey);

                    if (!whitelistEnabled) {
                        whitelistEnabled = false;
                    }

                    const serverStatusEmbed = new EmbedBuilder()
                        .setTitle("PalWord Server Status")
                        .addFields(
                            {
                                name: "**Server IP:**",
                                value: `\`\`\`${host}:${port}\`\`\``,
                                inline: false
                            },
                            {
                                name: "Status:",
                                value: `${(serverData.online ? "✅Online" : "❌Offline")}`,
                                inline: true
                            },
                            {
                                name: "Online Players:",
                                value: `${serverData.currentPlayers}/${serverData.maximumPlayers}`,
                                inline: true
                            },
                            {
                                name: "Players Peak:",
                                value: `${serverData.peakPlayers}`,
                                inline: true
                            },
                            {
                                name: "Whitelisted:",
                                value: `\`${whitelistEnabled}\``,
                                inline: true
                            },
                            {
                                name: "Player List:",
                                value: (serverData.playerList.length > 0 ? serverData.playerList.map(playerData => `\`${playerData.name}\``).join("\n") : "No Players"),
                                inline: false
                            },
                        );

                    let statusMessageEdited = false;
                    let statusMessageIdKey = `${statusChannelId}_${serverName.replaceAll(" ", "_")}_StatusMessageId`;
                    let statusMessageId = db.get(statusMessageIdKey);

                    if (statusMessageId) {
                        if (config.debug) {
                            console.log(`[RCON Service]: Editing Status Message for Server ${serverName}...`)
                        }

                        try {
                            let statusMessage = await client.channels.cache.get(statusChannelId).messages.fetch(statusMessageId);
                            if (statusMessage) {
                                statusMessage.edit({ embeds: [serverStatusEmbed] });
                                statusMessageEdited = true;
                            }
                        }catch (e) {
                            console.error(e);
                        }
                    }

                    if (!statusMessageEdited) {
                        if (config.debug) {
                            console.log(`[RCON Service]: No Status Message Exist for Server ${serverName}, Creating New Status Message...`)
                        }
                        const statusChannel = await client.channels.cache.get(statusChannelId);
                        const statusMessage = await statusChannel.send({ embeds: [serverStatusEmbed] });
                        db.set(statusMessageIdKey, statusMessage.id);
                    }
                }
            }
        }catch (e) {
            console.error(e);
        }
    }, 10000);

    //Another Faster Interval to track Whitelist and Join/Leave Message
    setInterval(async () => {
        try {
            if (config.debug) {
                console.log(`[RCON Service]: Checking for Whitelist and Join/Leave Messages...`);
            }

            let palServers = db.get("PalServers");

            if (!palServers || palServers.length < 1) {
                if (config.debug) {
                    console.log(`[RCON Service]: Skipping Server Check since no servers are added...`)
                }
                return;
            }

            //Looping through each guild aka Server
            for (const palServersKey of palServers) {
                const palServerKeySplit = palServersKey.split("_");

                let guildId = palServerKeySplit[0];

                let guildPalServersKey = `${guildId}_PalServers`;
                let guildPalServers = db.get(guildPalServersKey);

                //Looping through each Server added in a Guild aka Server
                for (const guildPalServer of guildPalServers) {
                    let serverName = guildPalServer.serverName;
                    let host = guildPalServer.host;
                    let RCONPort = guildPalServer.RCONPort;
                    let password = guildPalServer.password;

                    let defaultServerData = {
                        online: false,
                        currentPlayers: 0,
                        maximumPlayers: 32,
                        peakPlayers: 0,
                        playerList: []
                    }

                    const serverDataKey = `${guildId}_${serverName.replaceAll(" ", "_")}_ServerData`;
                    let serverData = db.get(serverDataKey);

                    if (!serverData) {
                        serverData = defaultServerData;
                    }

                    let previousPlayersList = serverData.playerList;

                    let serverPlayersInfoResponse = await getServerPlayersInfo(host, RCONPort, password);

                    if (serverPlayersInfoResponse.status === "success") {
                        serverData.online = true;
                        serverData.currentPlayers = serverPlayersInfoResponse.data.playerList.length;
                        serverData.peakPlayers = serverData.currentPlayers > serverData.peakPlayers ? serverData.currentPlayers : serverData.peakPlayers;
                        serverData.playerList = serverPlayersInfoResponse.data.playerList.filter(player => player.playeruid !== "00000000");

                        if (serverData.currentPlayers > serverData.maximumPlayers) {
                            serverData.maximumPlayers = serverData.currentPlayers
                        }
                    }else {
                        if (config.debug) {
                            console.log(`[RCON Service]: Skipping Server Check since Server ${serverName} is offline...`);
                        }
                        serverData.online = false;
                        db.set(serverDataKey, serverData);
                        return
                    }

                    db.set(serverDataKey, serverData);

                    if (serverData.currentPlayers < 1 && previousPlayersList.length < 1) {
                        if (config.debug) {
                            console.log(`[RCON Service]: Skipping Server Check since no players are online in Server ${serverName}...`)
                        }
                        return;
                    }

                    let previousPlayerSteamIds = previousPlayersList.map(previousPlayer => previousPlayer.steamid);
                    let previousPlayerUIds = previousPlayersList.map(previousPlayer => previousPlayer.playeruid);

                    let currentPlayerSteamIds = serverData.playerList.map(currentPlayer => currentPlayer.steamid);
                    let currentPlayerUIds = serverData.playerList.map(currentPlayer => currentPlayer.playeruid);

                    let newPlayersList = serverData.playerList.filter(player => !previousPlayerSteamIds.includes(player.steamid)
                        && !previousPlayerUIds.includes(player.playeruid));

                    let leftPlayersList = previousPlayersList.filter(previousPlayer => !currentPlayerSteamIds.includes(previousPlayer.steamid)
                        && !currentPlayerUIds.includes(previousPlayer.playeruid));

                    const whitelistEnabledKey = `${guildId}_${serverName.replaceAll(" ", "_")}_PalServerWhitelistEnabled`;
                    const whitelistEnabled = db.get(whitelistEnabledKey);

                    //Checking for Whitelist and showing only Whitelisted Players Join/Leave Messages
                    if (whitelistEnabled) {
                        if (config.debug) {
                            console.log(`[RCON Service]: Whitelist Enabled in Server ${serverName}... Checking for Whitelisted Players...`)
                        }
                        const whitelistedPlayersListKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
                        let whitelistedPlayers = db.get(whitelistedPlayersListKey);

                        if (!whitelistedPlayers) {
                            whitelistedPlayers = [];
                        }

                        /**
                         *Whitelisted Player Name Checks were added later so to avoid every player from being non whitelisted
                         * we've added an automatic data migration here.
                         *
                         * Players who are already using a spoofed account would get automatically migrated since they are whitelisted already.
                         */

                        let migratedWhitelistedPlayerList = [];
                        for (const whitelistedPlayer of whitelistedPlayers) {
                            if (!whitelistedPlayer.name) {
                                const whitelistedPlayerCurrentData = serverData.playerList
                                    .find(player => player.steamid === whitelistedPlayer.steamid && player.playeruid === whitelistedPlayer.playeruid);

                                if (whitelistedPlayerCurrentData) {
                                    whitelistedPlayer.name = whitelistedPlayerCurrentData.name;
                                }
                            }
                            migratedWhitelistedPlayerList.push(whitelistedPlayer);
                        }
                        whitelistedPlayers = migratedWhitelistedPlayerList;

                        db.set(whitelistedPlayersListKey, whitelistedPlayers);

                        let whitelistedPlayerNames = whitelistedPlayers.map(whitelistedPlayer => whitelistedPlayer.name);
                        let whitelistedPlayerSteamIds = whitelistedPlayers.map(whitelistedPlayer => whitelistedPlayer.steamid);
                        let whitelistedPlayerUIds = whitelistedPlayers.map(whitelistedPlayer => whitelistedPlayer.playeruid);

                        //Checking for Players who are not whitelisted and are online
                        let nonWhitelistedPlayers = serverData.playerList.filter(serverPlayer => !whitelistedPlayerSteamIds.includes(serverPlayer.steamid)
                            && !whitelistedPlayerUIds.includes(serverPlayer.playeruid) && !whitelistedPlayerNames.includes(serverPlayer.name));

                        let nameSpoofers = serverData.playerList.filter(serverPlayer => whitelistedPlayerSteamIds.includes(serverPlayer.steamid)
                            && whitelistedPlayerUIds.includes(serverPlayer.playeruid) && !whitelistedPlayerNames.includes(serverPlayer.name));

                        //Removing Non Whitelisted players from the list, we do not want to show join/left messages for non whitelisted players
                        newPlayersList = newPlayersList.filter(newPlayer => whitelistedPlayerSteamIds.includes(newPlayer.steamid)
                            && whitelistedPlayerUIds.includes(newPlayer.playeruid));

                        leftPlayersList = leftPlayersList.filter(leftPlayer => whitelistedPlayerSteamIds.includes(leftPlayer.steamid)
                            && whitelistedPlayerUIds.includes(leftPlayer.playeruid));

                        if (nonWhitelistedPlayers.length > 0) {
                            //Non Whitelisted Players are online
                            for (const nonWhitelistedPlayer of nonWhitelistedPlayers) {
                                kickPlayer(host, RCONPort, password, nonWhitelistedPlayer.steamid);

                                let nonWhitelistedPlayerName = nonWhitelistedPlayer.name;
                                let nonWhitelistedPlayerSteamId = nonWhitelistedPlayer.steamid;
                                let nonWhitelistedPlayerUId = nonWhitelistedPlayer.playeruid;

                                logToWhitelistLogChannel(client, guildId, serverName, "Non Whitelisted Player Kicked",
                                    `Player \`${nonWhitelistedPlayerName}\` with Steam ID \`${nonWhitelistedPlayerSteamId}\` 
                                            and UID \`${nonWhitelistedPlayerUId}\` has been Kicked from the server.`);
                            }
                        }

                        //Logging Name Spoofing Players here, we are not kicking here since they are kicked in the step above.
                        if (nameSpoofers.length > 0) {
                            for (const nameSpoofer of nameSpoofers) {
                                let nameSpooferName = nameSpoofer.name;
                                let nameSpooferSteamId = nameSpoofer.steamid;
                                let nameSpooferUId = nameSpoofer.playeruid;

                                logToWhitelistLogChannel(client, guildId, serverName, "Whitelisted Player Caught Name Spoofing!",
                                    `Player \`${nameSpooferName}\` with Steam ID \`${nameSpooferSteamId}\` 
                                            and UID \`${nameSpooferUId}\` has been Kicked from the server for name spoofing.`);
                            }
                        }
                    }else {
                        if (config.debug) {
                            console.log(`[RCON Service]: Whitelist Not Enabled in Server ${serverName}... Skipping Whitelist Checks...`)
                        }
                    }

                    //Join/Leave Messages
                    if (newPlayersList.length > 0 || leftPlayersList.length > 0) {

                        for (const newPlayer of newPlayersList) {
                            logToGameLogChannel(client, guildId, serverName, "Player Joined", `${newPlayer.name} has Joined the Server!`);
                            broadcastMessage(host, RCONPort, password, `${newPlayer.name} has Joined the Server!`);
                        }

                        for (const leftPlayer of leftPlayersList) {
                            logToGameLogChannel(client, guildId, serverName, "Player Left", `${leftPlayer.name} has Left the Server!`);
                            broadcastMessage(host, RCONPort, password, `${leftPlayer.name} has Left the Server!`);
                        }
                    }else {
                        if (config.debug) {
                            console.log(`[RCON Service]: No New Player Joined/Left the Server ${serverName} so skipping...`);
                        }
                    }
                }
            }
        }catch (e) {
            console.error(e);
        }
    }, 2000);
}
module.exports = {startRCONService}