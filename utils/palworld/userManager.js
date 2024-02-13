const {EmbedBuilder} = require("discord.js");
const {kickPlayer, banPlayer} = require("./palworldRCONWrapper");
const {logToGameLogChannel} = require("../discord/logger");

async function kickUser(interaction, data) {
    try {
        const db = interaction.client.db;

        const guildServersKey = `${interaction.guild.id}_PalServers`;
        let guildServers = db.get(guildServersKey);

        const kickEmbed = new EmbedBuilder().setColor(0x0099FF);

        if (!guildServers) {
            kickEmbed.setTitle("Server Does not Exist");
            kickEmbed.setDescription("You have not added any PalWorld Servers to the bot");
            await interaction.editReply({ embeds: [kickEmbed] });
            return;
        }

        const server = guildServers.find(server => server.serverName === data.serverName);

        if (!server) {
            kickEmbed.setTitle("Server Does not Exist");
            kickEmbed.setDescription("Invalid Server to Kick Player from");
            await interaction.editReply({ embeds: [kickEmbed] });
            return;
        }

        await kickPlayer(server.host, server.RCONPort, server.password, data.playerSteamId);

        kickEmbed.setTitle("Kicked Player");
        kickEmbed.setDescription(`Kicked Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`);
        await interaction.editReply({ embeds: [kickEmbed] });
        await logToGameLogChannel(interaction.client, interaction.guild.id, data.serverName, "Kicked Player", `Kicked Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`);
    }catch (e) {
        console.error(e)
    }
}

async function banUser(interaction, data) {
    try {
        const db = interaction.client.db;

        const guildServersKey = `${interaction.guild.id}_PalServers`;
        let guildServers = db.get(guildServersKey);

        const kickEmbed = new EmbedBuilder().setColor(0x0099FF);

        if (!guildServers) {
            kickEmbed.setTitle("Server Does not Exist");
            kickEmbed.setDescription("You have not added any PalWorld Servers to the bot");
            await interaction.editReply({ embeds: [kickEmbed] });
            return;
        }

        const server = guildServers.find(server => server.serverName === data.serverName);

        if (!server) {
            kickEmbed.setTitle("Server Does not Exist");
            kickEmbed.setDescription("Invalid Server to Ban Player from");
            await interaction.editReply({ embeds: [kickEmbed] });
            return;
        }

        await banPlayer(server.host, server.RCONPort, server.password, data.playerSteamId);

        kickEmbed.setTitle("Banned Player");
        kickEmbed.setDescription(`Banned Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`);
        await interaction.editReply({ embeds: [kickEmbed] });
        await logToGameLogChannel(interaction.client, interaction.guild.id, data.serverName, "Banned Player", `Banned Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`);
    }catch (e) {
        console.error(e)
    }
}

module.exports = {kickUser, banUser}