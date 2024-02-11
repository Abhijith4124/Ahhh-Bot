const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpalserver')
        .setDescription('Add your PalWorld Server Details')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('newpalserver')
            .setTitle('Add Your PalWorld Server');

        const serverNameInput = new TextInputBuilder()
            .setCustomId('serverNameInput')
            .setLabel("Server Name")
            .setPlaceholder("A PalWorld Server")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const hostInput = new TextInputBuilder()
            .setCustomId('hostInput')
            .setLabel("Server Host")
            .setPlaceholder("127.0.0.1")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const portInput = new TextInputBuilder()
            .setCustomId('portInput')
            .setLabel("Server Port")
            .setPlaceholder("25575")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const RCONPortInput = new TextInputBuilder()
            .setCustomId('RCONPortInput')
            .setLabel("RCON Port")
            .setPlaceholder("25575")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(5)
            .setRequired(true);

        const passwordInput = new TextInputBuilder()
            .setCustomId('passwordInput')
            .setLabel("RCON Password")
            .setPlaceholder("password")
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
};