const {SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listpalservers')
        .setDescription('List your PalWorld Servers')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        let guildPalServers = interaction.client.db.get(`${interaction.guild.id}_PalServers`);

        if (!guildPalServers || guildPalServers.length === 0) {
            await interaction.reply("You have no servers added.");
            return;
        }

        const serverListFields = guildPalServers.map((server) => ({ name: `${server.serverName}`, value: `${server.host}:${server.port}` }));

        const serverListEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Your PalWorld Servers')
            .setDescription('Here is a list of PalWorld Servers linked to this Server.')
            .addFields(...serverListFields);

        await interaction.reply({ embeds: [serverListEmbed] });
    }
}