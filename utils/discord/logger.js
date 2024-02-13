const {EmbedBuilder} = require("discord.js");
const config = require("../../config.json");

async function logToGameLogChannel(client, guild, serverName, title, message) {
    try {
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
                const logEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setColor("#00ff00")
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
                
                await channel.send({embeds: [logEmbed]});
            }

        }
    }catch (e) {
        console.error(e);
    }
}
module.exports = {logToGameLogChannel, logToWhitelistLogChannel}