const {getServerPlayersInfo, kickPlayer} = require("../../utils/palworld/palworldRCONWrapper");
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {logToGameLogChannel} = require("../../utils/discord/logger");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("kickplayer")
        .setDescription("Kick a Player from the server")
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to kick the player from")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName("playersteamid")
                .setDescription("Choose the Player from the Player List")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const db = interaction.client.db;

        let serverName = interaction.options.getString("server");
        let playerSteamId = interaction.options.getString("playersteamid");

        const guildServersKey = `${interaction.guild.id}_PalServers`;
        let guildServers = db.get(guildServersKey);

        const kickEmbed = new EmbedBuilder().setColor(0x0099FF);

        if (!guildServers) {
            kickEmbed.setTitle("Server Does not Exist");
            kickEmbed.setDescription("You have not added any PalWorld Servers to the bot");
            await interaction.reply({ embeds: [kickEmbed] });
            return;
        }

        const server = guildServers.find(server => server.serverName === serverName);

        if (!server) {
            kickEmbed.setTitle("Server Does not Exist");
            kickEmbed.setDescription("Invalid Server to Kick Player from");
            await interaction.reply({ embeds: [kickEmbed] });
            return;
        }

        kickPlayer(server.host, server.RCONPort, server.password, playerSteamId);

        kickEmbed.setTitle("Kicked Player");
        kickEmbed.setDescription(`Kicked Player with the Steam Id ${playerSteamId} from the server ${serverName}`);
        await interaction.reply({ embeds: [kickEmbed] });
        logToGameLogChannel(interaction.client, interaction.guild.id, serverName, "Kicked Player", `Kicked Player with the Steam Id ${playerSteamId} from the server ${serverName}`);
    },
    async autocomplete(interaction) {
        const db = interaction.client.db;
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "server") {
            let guildServers = db.get(`${interaction.guild.id}_PalServers`);

            if (!guildServers) {
                return;
            }

            await interaction.respond(guildServers.map(server => ({ name: server.serverName, value: server.serverName }) ));
        }

        if (focusedOption.name === "playersteamid") {
            let serverName = interaction.options.getString("server");
            let guildServers = db.get(`${interaction.guild.id}_PalServers`);

            if (!guildServers) {
                return;
            }

            const server = guildServers.find(server => server.serverName === serverName);

            let serverPlayersInfoResponse = await getServerPlayersInfo(server.host, server.RCONPort, server.password);

            if (serverPlayersInfoResponse.status === "success") {
                const playerList = serverPlayersInfoResponse.data.playerList.filter(player => player.playeruid !== "00000000");

                if (playerList.length > 0) {
                    await interaction.respond(playerList.map(player => ({ name: player.steamid, value: player.steamid }) ));
                }
            }
        }
    }
}