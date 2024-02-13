const {EmbedBuilder} = require("discord.js");
const config = require("../../config.json");

async function logToGameLogChannel(client, guild, serverName, title, message) {
    try {
        const gameLogChannelIdKey = `${guild}_${serverName.replaceAll(" ", "_")}_GameLogChannelId`;
        const gameLogChannelId = client.db.get(gameLogChannelIdKey);

        if (!client.guilds.cache.get(guild).members.me.permissionsIn(gameLogChannelId).has("SendMessages")) {
            if (config.debug) {
                console.log(`[LOGGER]: Permission Denied to Log Game Logs to ${serverName}`);
            }
            return;
        }

        if (gameLogChannelId) {
            const channel = await client.channels.fetch(gameLogChannelId);
            if (channel) {
                const logEmbed = new EmbedBuilder().setColor("#ff0000").setTitle(title).setDescription(message);
                await channel.send({embeds: [logEmbed]});
            }

        }
    }catch (e) {
        console.error(e);
    }
}

async function logToWhitelistLogChannel(client, guild, serverName, title, message) {
    try {
        const whitelistLogChannelIdKey = `${guild}_${serverName.replaceAll(" ", "_")}_WhitelistLogChannelId`;
        const whitelistLogChannelId = client.db.get(whitelistLogChannelIdKey);

        if (!client.guilds.cache.get(guild).members.me.permissionsIn(whitelistLogChannelId).has("SendMessages")) {
            if (config.debug) {
                console.log(`[LOGGER]: Permission Denied to Log Whitelist Message to ${serverName}`);
            }
            return;
        }

        if (whitelistLogChannelId) {
            const channel = await client.channels.fetch(whitelistLogChannelId);
            if (channel) {
                const logEmbed = new EmbedBuilder().setColor("#ff0000").setTitle(title).setDescription(message);
                await channel.send({embeds: [logEmbed]});
            }

        }
    }catch (e) {
        console.error(e);
    }
}
module.exports = {logToGameLogChannel, logToWhitelistLogChannel}