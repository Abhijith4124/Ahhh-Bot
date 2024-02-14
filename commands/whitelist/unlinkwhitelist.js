const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlinkwhitelist")
        .setDescription("Unlink a Whitelisted Player from a Discord User, it will remove the Whitelisted Role if provided")
        .addStringOption(option =>
            option.setName("servername")
                .setDescription("The server the whitelisted player belongs to")
                .setRequired(true)
                .setAutocomplete(true)
        ).addStringOption(option =>
            option.setName("playername")
                .setDescription("The In Game Name of the player you want to unlink")
                .setRequired(true)
                .setAutocomplete(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        await interaction.deferReply();

        const serverName = interaction.options.getString("servername");
        const playerName = interaction.options.getString("playername");

        const db = interaction.client.db;
        const guildId = interaction.guild.id;

        const whitelistedPlayersListKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
        let whitelistedPlayers = db.get(whitelistedPlayersListKey);

        if (!whitelistedPlayers || whitelistedPlayers.length < 1) {
            await interaction.editReply(`No whitelisted players found for server ${serverName}`);
            return;
        }

        let whitelistedPlayerIndex = whitelistedPlayers.findIndex(player => player.name === playerName);
        let whitelistedPlayer = whitelistedPlayers[whitelistedPlayerIndex];

        if (!whitelistedPlayer || whitelistedPlayerIndex === -1) {
            await interaction.editReply(`Player ${playerName} not found in the whitelist for server ${serverName}`);
            return;
        }

        const discordUser = whitelistedPlayer.discorduser;

        if (!discordUser) {
            await interaction.editReply(`No Discord User linked to player ${playerName} for server ${serverName}`);
            return;
        }

        delete whitelistedPlayer.discorduser;

        whitelistedPlayers[whitelistedPlayerIndex] = whitelistedPlayer;

        db.set(whitelistedPlayersListKey, whitelistedPlayers);

        const whitelistRoleIdKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistRoleId`;
        const whitelistRoleId = db.get(whitelistRoleIdKey);

        if (!whitelistRoleId) {
            await interaction.editReply(`No Whitelist Role found for server ${serverName}. Please set a whitelist role using /serverconfig`);
            return
        }

        const role = interaction.guild.roles.cache.get(whitelistRoleId);
        if (!role) {
            await interaction.editReply(`Whitelist Role not found for server ${serverName}`);
            return
        }

        let guildUser = await interaction.guild.members.fetch(discordUser);
        if (guildUser.roles.cache.has(whitelistRoleId)) {
            await guildUser.roles.remove(role);
        }

        const discordUnlinkedFromPlayerEmbed = new EmbedBuilder()
            .setColor(0x0099FF).setTitle(`Discord Unlinked from Player!`)
            .setDescription(`Discord User ${discordUser} Unlinked from Player ${whitelistedPlayer.name}`);
        await interaction.editReply({ embeds: [discordUnlinkedFromPlayerEmbed] });
    },
    async autocomplete(interaction) {
        const db = interaction.client.db;
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "servername") {
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
            let serverName = interaction.options.getString("servername");

            if (!serverName) {
                return;
            }

            const whitelistedPlayersListKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
            let whitelistedPlayers = db.get(whitelistedPlayersListKey);

            if (!whitelistedPlayers || whitelistedPlayers.length < 1) {
                return;
            }

            await interaction.respond(whitelistedPlayers.map(player => ({ name: player.name, value: player.name }) ));
        }
    }
}