const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whitelist")
        .setDescription("Enable or Disable Whitelist for the Server")
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to enable or disable Whitelist for")
                .setRequired(true)
                .setAutocomplete(true)
        ).addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or Disable Whitelist")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const db = interaction.client.db;
        const guildId = interaction.guild.id;

        const serverName = interaction.options.getString("server");
        const whitelistEnabled = interaction.options.getBoolean("enabled");

        const guildPalServerWhitelistEnabledKey = `${guildId}_${serverName.replaceAll(" ", "_")}_PalServerWhitelistEnabled`;
        db.set(guildPalServerWhitelistEnabledKey, whitelistEnabled);

        const whitelistStatusChangeEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Whitelist Status Changed")
            .setDescription(`Whitelist Status for the Server ${serverName} has been changed to \`${whitelistEnabled}\``);

        await interaction.reply({ embeds: [whitelistStatusChangeEmbed] })
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
    }
}