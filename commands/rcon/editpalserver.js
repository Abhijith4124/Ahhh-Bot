const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editpalserver')
        .setDescription('Edit your existing PalWorld Server Details')
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to edit")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const db = interaction.client.db;
        const serverName = interaction.options.getString("server");

        let guildServers = db.get(`${interaction.guild.id}_PalServers`);

        if (!guildServers) {
            await interaction.reply("You have no servers added to edit.");
            return;
        }

        const palServerIndex = guildServers.findIndex(server => server.serverName === serverName);

        if (palServerIndex === -1) {
            await interaction.reply("Could not find the server you are trying to edit. Please try again.");
            return;
        }

        const guildPalServer = guildServers[palServerIndex];

        const modal = new ModalBuilder()
            .setCustomId('editpalserver')
            .setTitle('Edit PalWorld Server Details');

        const serverNameInput = new TextInputBuilder()
            .setCustomId('serverNameInput')
            .setLabel("Server Name")
            .setValue(guildPalServer.serverName)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const hostInput = new TextInputBuilder()
            .setCustomId('hostInput')
            .setLabel("Server Host")
            .setValue(guildPalServer.host)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const portInput = new TextInputBuilder()
            .setCustomId('portInput')
            .setLabel("Server Port")
            .setValue(guildPalServer.port)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const RCONPortInput = new TextInputBuilder()
            .setCustomId('RCONPortInput')
            .setLabel("RCON Port")
            .setValue(guildPalServer.RCONPort)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(5)
            .setRequired(true);

        const passwordInput = new TextInputBuilder()
            .setCustomId('passwordInput')
            .setLabel("RCON Password")
            .setPlaceholder("renter your password")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const first = new ActionRowBuilder().addComponents(serverNameInput);
        const second = new ActionRowBuilder().addComponents(hostInput);
        const third = new ActionRowBuilder().addComponents(portInput);
        const fourth = new ActionRowBuilder().addComponents(RCONPortInput);
        const fifth = new ActionRowBuilder().addComponents(passwordInput);

        modal.addComponents(first, second, third, fourth, fifth);

        await interaction.showModal(modal);
    },
    async autocomplete(interaction) {
        const db = interaction.client.db;
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === "server") {
            let guildServers = db.get(`${interaction.guild.id}_PalServers`);

            if (!guildServers) {
                return;
            }

            await interaction.respond(guildServers.map(server => ({ name: server.serverName, value: server.serverName }) ));
        }
    }
};