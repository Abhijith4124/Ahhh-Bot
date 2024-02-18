const {EmbedBuilder} = require("discord.js");
const {kickPlayer, banPlayer} = require("./palworldRCONWrapper");

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

        let kickPlayerResponse = await kickPlayer(server.host, server.RCONPort, server.password, data.playerSteamId);

        if (kickPlayerResponse.status === "success") {
            kickEmbed.setTitle("Kicked Player");
            kickEmbed.setDescription(`Kicked Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`);
        }else {
            kickEmbed.setTitle("Failed to Kick Player");
            kickEmbed.setDescription(`Failed to Kick Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`);
        }

        await interaction.editReply({ embeds: [kickEmbed] });
        await interaction.client.logger.logToGameLogChannel(interaction.client, interaction.guild.id, data.serverName, "Kicked Player", `Kicked Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`);
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

        let banPlayerResponse = await banPlayer(server.host, server.RCONPort, server.password, data.playerSteamId);

        let title = "";
        let description = ""

        if (banPlayerResponse.status === "success") {
            title = "Banned Player";
            description = `Banned Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`
        }else {
            title = "Failed to Ban Player"
            description = `Failed to Ban Player with the Steam Id ${data.playerSteamId} from the server ${data.serverName}`
        }

        kickEmbed.setTitle(title);
        kickEmbed.setDescription(description);

        await interaction.editReply({ embeds: [kickEmbed] });
        await interaction.client.logger.logToGameLogChannel(interaction.client, interaction.guild.id, data.serverName, title, description);
    }catch (e) {
        console.error(e)
    }
}

module.exports = {kickUser, banUser}