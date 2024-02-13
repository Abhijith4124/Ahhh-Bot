const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require("discord.js");
const config = require("../../config.json");
const {ButtonStyle, ComponentType} = require("discord-api-types/v10");
const {addWhiteList} = require("../../commands/whitelist/addwhitelist");
const {whitelistPlayer} = require("../palworld/whitelistManager");
const {banUser} = require("../palworld/userManager");

async function logToGameLogChannel(client, guild, serverName, title, message) {
    try {
        const titleColorMapping = {
            "Player Joined": "#00ff00",
            "Player Left": "#ff0000",
            "Kicked Player": "#fff900",
            "Banned Player": "#ff8000"
        }

        const gameLogChannelIdKey = `${guild}_${serverName.replaceAll(" ", "_")}_GameLogChannelId`;
        const gameLogChannelId = client.db.get(gameLogChannelIdKey);

        if (gameLogChannelId) {

            if (!client.guilds.cache.get(guild).members.me.permissionsIn(gameLogChannelId).has("SendMessages")) {
                if (config.debug) {
                    console.log(`[LOGGER]: Permission Denied to Log Game Logs to ${serverName}`);
                }
                return;
            }

            const channel = await client.channels.fetch(gameLogChannelId);
            if (channel) {
                let embedColor = titleColorMapping[title];
                if (!embedColor) {
                    embedColor = "#c4edfa";
                }

                const logEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setColor(embedColor)
                .setFooter({
                  text: "Ahhh bot",
                })
                .setTimestamp();
                
                await channel.send({embeds: [logEmbed]});
            }

        }
    }catch (e) {
        console.error(e);
    }
}

async function logToWhitelistLogChannel(client, guild, serverName, title, message, playerName, steamId, playerUid) {
    try {
        const whitelistLogChannelIdKey = `${guild}_${serverName.replaceAll(" ", "_")}_WhitelistLogChannelId`;
        const whitelistLogChannelId = client.db.get(whitelistLogChannelIdKey);

        if (whitelistLogChannelId) {

            if (!client.guilds.cache.get(guild).members.me.permissionsIn(whitelistLogChannelId).has("SendMessages")) {
                if (config.debug) {
                    console.log(`[LOGGER]: Permission Denied to Log Whitelist Message to ${serverName}`);
                }
                return;
            }

            const channel = await client.channels.fetch(whitelistLogChannelId);
            if (channel) {
                const logEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .addFields(
                  {
                    name: "__Player Name__",
                    value: `\`\`\`\n${playerName}\n\`\`\``,
                    inline: false
                  },
                  {
                    name: "__Steam ID__",
                    value: `\`\`\`\n${steamId}\n\`\`\``,
                    inline: false
                  },
                  {
                    name: "__Player UID__",
                    value: `\`\`\`\n${playerUid}\n\`\`\``,
                    inline: false
                  },
                )
                .setColor("#ffff00")
                .setFooter({
                  text: "Ahhh bot",
                })
                .setTimestamp();

                let actionButton = new ButtonBuilder();
                if (title === "Non Whitelisted Player Kicked") {
                    actionButton
                        .setCustomId("whitelistplayer")
                        .setLabel("Whitelist Player")
                        .setStyle(ButtonStyle.Success).setEmoji("✅")
                }else if (title === "Whitelisted Player Caught Name Spoofing!") {
                    actionButton
                        .setCustomId("banplayer")
                        .setLabel("Ban Player")
                        .setStyle(ButtonStyle.Danger).setEmoji("🔨")
                }

                const actionRow = new ActionRowBuilder().addComponents(actionButton);
                
                const response = await channel.send({ embeds: [logEmbed], components: [actionRow] });

                const collector  = await response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000});

                collector.on('collect', async (interaction) => {
                    await interaction.deferReply();
                    if (interaction.customId === "whitelistplayer") {

                        await whitelistPlayer(interaction, {
                            serverName:serverName,
                            inGameName: playerName,
                            steamId: steamId,
                            playerUid: playerUid
                        });
                    }

                    if (interaction.customId === "banplayer") {

                        await banUser(interaction, {
                            serverName: serverName,
                            playerSteamId: steamId
                        })
                    }
                })
            }

        }
    }catch (e) {
        console.error(e);
    }
}
module.exports = {logToGameLogChannel, logToWhitelistLogChannel}