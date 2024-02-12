const {EmbedBuilder} = require("discord.js");

async function logToGameLogChannel(client, guild, serverName, title, message) {
    const gameLogChannelIdKey = `${guild}_${serverName.replaceAll(" ", "_")}_GameLogChannelId`;
    const gameLogChannelId = client.db.get(gameLogChannelIdKey);

    if (gameLogChannelId) {
        const channel = await client.channels.fetch(gameLogChannelId);
        if (channel) {
            const logEmbed = new EmbedBuilder().setColor("#ff0000").setTitle(title).setDescription(message);
            await channel.send({embeds: [logEmbed]});
        }

    }
}

async function logToWhitelistLogChannel(client, guild, serverName, title, message) {
    const whitelistLogChannelIdKey = `${guild}_${serverName.replaceAll(" ", "_")}_WhitelistLogChannelId`;
    const whitelistLogChannelId = client.db.get(whitelistLogChannelIdKey);

    if (whitelistLogChannelId) {
        const channel = await client.channels.fetch(whitelistLogChannelId);
        if (channel) {
            const logEmbed = new EmbedBuilder().setColor("#ff0000").setTitle(title).setDescription(message);
            await channel.send({embeds: [logEmbed]});
        }

    }
}
module.exports = {logToGameLogChannel, logToWhitelistLogChannel}