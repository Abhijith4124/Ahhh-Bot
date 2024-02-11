const {EmbedBuilder} = require("discord.js");
async function logToLogChannel(client, guild, serverName, title, message) {
    const statusChannelIdKey = `${guild}_${serverName.replaceAll(" ", "_")}_StatusChannelId`;
    const statusChannelId = client.db.get(statusChannelIdKey);

    if (statusChannelId) {
        const channel = await client.channels.fetch(statusChannelId);
        if (channel) {
            const logEmbed = new EmbedBuilder().setColor("#ff0000").setTitle(title).setDescription(message);
            await channel.send({embeds: [logEmbed]});
        }

    }
}

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
module.exports = {logToLogChannel, logToGameLogChannel}