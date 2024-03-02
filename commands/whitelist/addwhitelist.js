const {SlashCommandBuilder, EmbedBuilder, TextInputBuilder, RoleSelectMenuBuilder, ActionRowBuilder, ModalBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
const {whitelistPlayer} = require("../../utils/palworld/whitelistManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addwhitelist")
        .setDescription("Add a player to the whitelist")
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to add the player to")
                .setRequired(true)
                .setAutocomplete(true)
        ).addStringOption(option =>
            option.setName("ingamename")
                .setDescription("In Game Name of the player to whitelist")
                .setRequired(true)
        ).addStringOption(option =>
            option.setName("steamid")
                .setDescription("Steam ID of the player to whitelist")
                .setRequired(true)
        ).addStringOption(option =>
            option.setName("playeruid")
                .setDescription("Player UID of the played to whitelist")
                .setRequired(true)
        ).addUserOption(option =>
            option.setName("discorduser")
                .setDescription("Discord ID of the player getting whitelisted. Bot will not announce and assign role if not provided.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        await interaction.deferReply();

        const serverName = interaction.options.getString("server");
        const inGameName = interaction.options.getString("ingamename").trim();
        const steamId = interaction.options.getString("steamid").trim();
        const playerUid = interaction.options.getString("playeruid").trim();
        const discordUser = interaction.options.getUser("discorduser");

        await whitelistPlayer(interaction, {
            serverName:serverName,
            inGameName: inGameName,
            steamId: steamId,
            playerUid: playerUid,
            discordUser: discordUser
        });
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
    },
    async addWhiteList() {

    }
}