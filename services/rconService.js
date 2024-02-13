const {EmbedBuilder} = require("discord.js");
const {getServerPlayersInfo, kickPlayer, broadcastMessage} = require("../utils/palworld/palworldRCONWrapper");
const {logToGameLogChannel, logToWhitelistLogChannel} = require("../utils/discord/logger");

const config = require("../config.json");

let firstRun = true;

async function doFirstRun(client, db) {
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
}

async function startRCONService(client, db) {
    await doFirstRun(client, db);

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

                    if (serverData.online === false) {
                        serverData = defaultServerData;
                    }

                    const serverStatusEmbed = new EmbedBuilder()
                    .setTitle("📊 **Palworld Server Status**")
                    .addFields(
                        {
                            name: "Server IP:",
                            value: `\`\`\`${host}:${port}\`\`\``,
                            inline: false
                        },
                        {
                            name: "__Status__",
                            value: `${(serverData.online ? "✅Online" : "❌Offline")}`,
                            inline: true
                        },
                        {
                          name: "__Online Players__",
                          value: `${serverData.currentPlayers}/${serverData.maximumPlayers}`,
                          inline: true
                        },
                        {
                          name: "__Players Peak__",
                          value: `${serverData.peakPlayers}`,
                          inline: true
                        },
                        {
                          name: "Whitelist Status",
                          value: `\`${whitelistEnabled}\``,
                          inline: false
                        },
                        {
                          name: "__Player List__",
                          value: (serverData.playerList.length > 0 ? serverData.playerList.map(playerData => `${playerData.name}`).join("\n") : "No Players"),
                          inline: false
                        },
                    )
                    .setColor("#1adb93")
                    .setFooter({
                      text: "Ahhh bot",
                    })
                    .setTimestamp();

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

                        if (!client.guilds.cache.get(guildId).members.me.permissionsIn(statusChannel).has("SendMessages")) {
                            if (config.debug) {
                                console.log(`[RCON Service]: Permission Denied to Send Status Message to ${serverName}`);
                            }
                            continue;
                        }

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

                    //Sorting Server Players
                    const whitelistedPlayersListKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
                    let whitelistedPlayers = db.get(whitelistedPlayersListKey);

                    let nonWhitelistedPlayers = [];
                    let nameSpoofingPlayers = [];

                    let joinedPlayers = [];
                    let leftPlayers = [];

                    let currentWhitelistedPlayers = [];

                    for (const serverPlayer of serverData.playerList) {
                        const whitelistedPlayerData = whitelistedPlayers.find(whitelistedPlayer => whitelistedPlayer.steamid === serverPlayer.steamid
                            && whitelistedPlayer.playeruid === serverPlayer.playeruid);

                        if (!whitelistedPlayerData) {
                            //User Is not whitelisted
                            nonWhitelistedPlayers.push(serverPlayer);
                            continue;
                        }

                        if (whitelistedPlayerData && whitelistedPlayerData.name !== serverPlayer.name) {
                            //Player is Name Spoofing
                            nameSpoofingPlayers.push({...serverPlayer, originalName: whitelistedPlayerData.name});
                            continue;
                        }

                        currentWhitelistedPlayers.push(serverPlayer);

                        if (!previousPlayersList.find(previousPlayer => previousPlayer.steamid === serverPlayer.steamid
                            && previousPlayer.playeruid === serverPlayer.playeruid)) {
                            //New Player has Joined
                            joinedPlayers.push(serverPlayer);
                        }
                    }

                    for (const previousPlayer of previousPlayersList) {
                        if (!currentWhitelistedPlayers.find(currentPlayer => currentPlayer.steamid === previousPlayer.steamid
                            && currentPlayer.playeruid === previousPlayer.playeruid)) {
                            //Player is not there in current Players list, so they left
                            leftPlayers.push(previousPlayer);
                        }
                    }

                    serverData.playerList = currentWhitelistedPlayers;
                    serverData.currentPlayers = currentWhitelistedPlayers.length;
                    db.set(serverDataKey, serverData);

                    /**
                     *Whitelisted Player Name Checks were added later so to avoid every player from being non whitelisted
                     * we've added an automatic data migration here.
                     *
                     * Players who are already using a spoofed account would get automatically migrated since they are whitelisted already.
                     */

                    let migratedWhitelistedPlayerList = [];
                    for (const whitelistedPlayer of whitelistedPlayers) {
                        if (!whitelistedPlayer.name) {
                            const whitelistedPlayerCurrentData = currentWhitelistedPlayers
                                .find(player => player.steamid === whitelistedPlayer.steamid && player.playeruid === whitelistedPlayer.playeruid);

                            if (whitelistedPlayerCurrentData) {
                                whitelistedPlayer.name = whitelistedPlayerCurrentData.name;
                            }
                        }
                        migratedWhitelistedPlayerList.push(whitelistedPlayer);
                    }
                    whitelistedPlayers = migratedWhitelistedPlayerList;
                    db.set(whitelistedPlayersListKey, whitelistedPlayers);

                    const whitelistEnabledKey = `${guildId}_${serverName.replaceAll(" ", "_")}_PalServerWhitelistEnabled`;
                    const whitelistEnabled = db.get(whitelistEnabledKey);

                    //Checking for Whitelist and showing only Whitelisted Players Join/Leave Messages
                    if (whitelistEnabled) {
                        if (config.debug) {
                            console.log(`[RCON Service]: Whitelist Enabled in Server ${serverName}... Checking for Whitelisted Players...`)
                        }

                        if (nonWhitelistedPlayers.length > 0) {
                            //Non Whitelisted Players are online
                            for (const nonWhitelistedPlayer of nonWhitelistedPlayers) {
                                //Giving some time before kicking to prevent players from being stuck in loading screen!
                                await kickPlayer(host, RCONPort, password, nonWhitelistedPlayer.steamid);

                                let nonWhitelistedPlayerName = nonWhitelistedPlayer.name;
                                let nonWhitelistedPlayerSteamId = nonWhitelistedPlayer.steamid;
                                let nonWhitelistedPlayerUId = nonWhitelistedPlayer.playeruid;

                                await logToWhitelistLogChannel(client, guildId, serverName, "Non Whitelisted Player Kicked",
                                    `Player \`${nonWhitelistedPlayerName}\` with Steam ID \`${nonWhitelistedPlayerSteamId}\` 
                                            and UID \`${nonWhitelistedPlayerUId}\` has been Kicked from the server.`,
                                    nonWhitelistedPlayerName, nonWhitelistedPlayerSteamId, nonWhitelistedPlayerUId);
                            }
                        }

                        //Logging Name Spoofing Players here, we are not kicking here since they are kicked in the step above.
                        if (nameSpoofingPlayers.length > 0) {
                            for (const nameSpoofer of nameSpoofingPlayers) {
                                await kickPlayer(host, RCONPort, password, nameSpoofer.steamid);

                                await logToWhitelistLogChannel(client, guildId, serverName, "Whitelisted Player Caught Name Spoofing!",
                                    `Player \`${nameSpoofer.originalName}\` caught Spoofing the Name: \`${nameSpoofer.name}\` with Steam ID \`${nameSpoofer.steamid}\` and UID \`${nameSpoofer.playeruid}\` has been Kicked from the server for name spoofing.`,
                                    nameSpoofer.originalName, nameSpoofer.steamid, nameSpoofer.playeruid);
                            }
                        }
                    }else {
                        if (config.debug) {
                            console.log(`[RCON Service]: Whitelist Not Enabled in Server ${serverName}... Skipping Whitelist Checks...`)
                        }
                    }

                    //Join/Leave Messages
                    if (joinedPlayers.length > 0 || leftPlayers.length > 0) {

                        for (const newPlayer of joinedPlayers) {
                            await logToGameLogChannel(client, guildId, serverName, "Player Joined", `${newPlayer.name} has Joined the Server!`);
                            await broadcastMessage(host, RCONPort, password, `${newPlayer.name} has Joined the Server!`);
                        }

                        for (const leftPlayer of leftPlayers) {
                            await logToGameLogChannel(client, guildId, serverName, "Player Left", `${leftPlayer.name} has Left the Server!`);
                            await broadcastMessage(host, RCONPort, password, `${leftPlayer.name} has Left the Server!`);
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
    }, 5000);
}
module.exports = {startRCONService}