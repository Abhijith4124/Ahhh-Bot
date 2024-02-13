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
        await interaction.deferReply();

        let serverName = interaction.options.getString("server");
        let playerSteamId = interaction.options.getString("playersteamid");

        await kickPlayer(interaction, {
            serverName: serverName,
            playerSteamId: playerSteamId
        })
    },
    async autocomplete(interaction) {
        const db = interaction.client.db;
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "server") {
            let guildServers = db.get(`${interaction.guild.id}_PalServers`);

            if (!guildServers) {
                return;
            }

            if (guildServers.length > 10) {
                guildServers = guildServers.filter(guildServer => guildServer.serverName.toLowerCase().includes(focusedOption.value.toLowerCase()));
                guildServers = guildServers.slice(0, 11);
            }

            await interaction.respond(guildServers.map(server => ({ name: server.serverName, value: server.serverName }) ));
        }

        if (focusedOption.name === "playersteamid") {
            let serverName = interaction.options.getString("server");

            if (!serverName) {
                serverName = ""
            }

            let guildServers = db.get(`${interaction.guild.id}_PalServers`);

            if (!guildServers) {
                return;
            }

            const server = guildServers.find(server => server.serverName === serverName);

            let serverPlayersInfoResponse = await getServerPlayersInfo(server.host, server.RCONPort, server.password);

            if (serverPlayersInfoResponse.status === "success") {
                let playerList = serverPlayersInfoResponse.data.playerList.filter(player => player.playeruid !== "00000000");

                if (playerList.length > 0) {
                    if (playerList.length > 10) {
                        playerList = playerList.filter(player => player.steamid.toLowerCase().includes(focusedOption.value.toLowerCase()));
                        playerList = playerList.slice(0, 11);
                    }
                    await interaction.respond(playerList.map(player => ({ name: player.steamid, value: player.steamid }) ));
                }
            }
        }
    }
}