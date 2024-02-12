const {broadcastMessage} = require("../../utils/palworld/palworldRCONWrapper");
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("broadcast")
        .setDescription("Broadcast a message to the Server")
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to broadcast the message to")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message you want to broadcast")
                .setRequired(true)
                .setMaxLength(48)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const db = interaction.client.db;
        let serverName = interaction.options.getString("server");

        const guildServersKey = `${interaction.guild.id}_PalServers`;
        let guildServers = db.get(guildServersKey);

        const broadcastEmbed = new EmbedBuilder().setColor(0x0099FF);

        if (!guildServers) {
            broadcastEmbed.setTitle("Server Does not Exist");
            broadcastEmbed.setDescription("Invalid Server to Broadcast to");
            await interaction.reply({ embeds: [broadcastEmbed] });
            return;
        }

        const server = guildServers.find(server => server.serverName === serverName);

        if (!server) {
            broadcastEmbed.setTitle("Server Does not Exist");
            broadcastEmbed.setDescription("Invalid Server to Broadcast to");
            await interaction.reply({ embeds: [broadcastEmbed] });
            return;
        }

        const message = interaction.options.getString("message").replaceAll(" ", "_");
        broadcastMessage(server.host, server.RCONPort, server.password, message);
        broadcastEmbed.setTitle("Server Broadcast");
        broadcastEmbed.setDescription(`Broadcast Message: ${message}`);
        await interaction.reply({ embeds: [broadcastEmbed] });
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