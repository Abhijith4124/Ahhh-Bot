const {saveServer} = require("../../utils/palworld/palworldRCONWrapper");
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("save")
        .setDescription("Saves the Game Progress")
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to save the progress for")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const db = interaction.client.db;
        let serverName = interaction.options.getString("server");

        const guildServersKey = `${interaction.guild.id}_PalServers`;
        let guildServers = db.get(guildServersKey);

        const saveEmbed = new EmbedBuilder().setColor(0x0099FF);

        if (!guildServers) {
            saveEmbed.setTitle("Server Does not Exist");
            saveEmbed.setDescription("Invalid Server to Save");
            await interaction.reply({ embeds: [saveEmbed] });
            return;
        }

        const server = guildServers.find(server => server.serverName === serverName);

        if (!server) {
            saveEmbed.setTitle("Server Does not Exist");
            saveEmbed.setDescription("Invalid Server to Save");
            await interaction.reply({ embeds: [saveEmbed] });
            return;
        }

        saveServer(server.host, server.RCONPort, server.password);

        saveEmbed.setTitle("Server Broadcast");
        saveEmbed.setDescription(`Saved Server!`);
        await interaction.reply({ embeds: [saveEmbed] });
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
    }
}