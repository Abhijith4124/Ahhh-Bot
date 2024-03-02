const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
const {removeWhitelist} = require("../../utils/palworld/whitelistManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removewhitelist")
        .setDescription("Remove a player from the whitelist")
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to add the player to")
                .setRequired(true)
                .setAutocomplete(true)
        ).addStringOption(option =>
            option.setName("playername")
                .setDescription("Player to remove from whitelist")
                .setRequired(true)
                .setAutocomplete(true)
        ).addUserOption(option =>
            option.setName("discorduser")
                .setDescription("Discord ID of the player getting whitelisted (optional). Bot will not remove role if not provided.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        await interaction.deferReply();

        const serverName = interaction.options.getString("server");
        const playerName = interaction.options.getString("playername");
        const discordUser = interaction.options.getUser("discorduser");

        await removeWhitelist(interaction, {
            serverName: serverName,
            playerName: playerName,
            discordUser: discordUser
        })
    },
    async autocomplete(interaction) {
        const db = interaction.client.db;
        const focusedOption = interaction.options.getFocused(true);

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

        if (focusedOption.name === "playername") {
            let serverName = interaction.options.getString("server");

            if (!serverName) {
                return;
            }

            const whitelistedPlayersListKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
            let whitelistedPlayers = db.get(whitelistedPlayersListKey);

            if (!whitelistedPlayers || whitelistedPlayers.length < 1) {
                return;
            }

            whitelistedPlayers = whitelistedPlayers.filter(player => player.name.toLowerCase().includes(focusedOption.value.toLowerCase()));

            if (whitelistedPlayers.length > 10) {
                whitelistedPlayers = whitelistedPlayers.slice(0, 11);
            }

            await interaction.respond(whitelistedPlayers.map(player => ({ name: `${player.name} SteamID: ${player.steamid}`, value: player.name })));
        }
    }
}