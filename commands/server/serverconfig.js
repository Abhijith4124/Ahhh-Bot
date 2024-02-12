const {SlashCommandBuilder, ChannelSelectMenuBuilder, ActionRowBuilder, RoleSelectMenuBuilder} = require("discord.js");
const {PermissionFlagsBits, ChannelType, ComponentType} = require("discord-api-types/v10");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverconfig')
        .setDescription('Config the Discord bot Settings for the server')
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The PalWorld Server to config with the current Discord server")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const db = interaction.client.db;
        const serverName = interaction.options.getString("server");

        const gameLogChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_GameLogChannelId`;
        const statusChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_StatusChannelId`;
        const whitelistAnnouncementChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistAnnouncementChannelId`;
        const whitelistLogChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistLogChannelId`;
        const whitelistRoleIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistRoleId`;

        const gameLogChannelId = db.get(gameLogChannelIdKey);
        const statusChannelId = db.get(statusChannelIdKey);
        const whitelistAnnouncementChannelId = db.get(whitelistAnnouncementChannelIdKey);
        const whitelistLogChannelId = db.get(whitelistLogChannelIdKey);
        const whitelistRoleId = db.get(whitelistRoleIdKey);


        const gameLogChannelMenu = new ChannelSelectMenuBuilder()
            .setCustomId("gamelogchannel")
            .setPlaceholder("#gamelogchannel")
            .setChannelTypes(ChannelType.GuildText)

        if (gameLogChannelId) {
            gameLogChannelMenu.setDefaultChannels([gameLogChannelId])
        }

        const statusChannelMenu = new ChannelSelectMenuBuilder()
            .setCustomId("statuschannel")
            .setPlaceholder("#stauschannel")
            .setChannelTypes(ChannelType.GuildText);

        if (statusChannelId) {
            statusChannelMenu.setDefaultChannels([statusChannelId])
        }

        const whitelistAnnouncementChannelMenu = new ChannelSelectMenuBuilder()
            .setCustomId("whitelistannouncementchannel")
            .setPlaceholder("#whitelistannouncementchannel")
            .setChannelTypes(ChannelType.GuildText);

        if (whitelistAnnouncementChannelId) {
            whitelistAnnouncementChannelMenu.setDefaultChannels([whitelistAnnouncementChannelId])
        }

        const whitelistLogChannelMenu = new ChannelSelectMenuBuilder()
            .setCustomId("whitelistlogchannel")
            .setPlaceholder("#whitelistlogchannel")
            .setChannelTypes(ChannelType.GuildText);

        if (whitelistLogChannelId) {
            whitelistLogChannelMenu.setDefaultChannels([whitelistLogChannelId])
        }

        const whitelistRoleIdMenu = new RoleSelectMenuBuilder()
            .setCustomId("whitelistroleid")
            .setPlaceholder("@whitelistrole");

        if (whitelistRoleId) {
            whitelistRoleIdMenu.setDefaultRoles([whitelistRoleId]);
        }

        const row1 = new ActionRowBuilder().addComponents(gameLogChannelMenu);
        const row2 = new ActionRowBuilder().addComponents(statusChannelMenu);
        const row3 = new ActionRowBuilder().addComponents(whitelistAnnouncementChannelMenu);
        const row4 = new ActionRowBuilder().addComponents(whitelistLogChannelMenu);
        const row5 = new ActionRowBuilder().addComponents(whitelistRoleIdMenu);

        const response = await interaction.reply({ content: `Configure Discord Server for ${serverName} `, components: [row1, row2, row3, row4, row5] });

        const channelSelectionCollector = response.createMessageComponentCollector({ componentType: ComponentType.ChannelSelect, time: 3_600_000 });
        const roleSelectionCollector = response.createMessageComponentCollector({ componentType: ComponentType.RoleSelect, time: 3_600_000 });

        channelSelectionCollector.on("collect", async (menuInteraction) => {
            if (menuInteraction.customId === "gamelogchannel") {
                const gameLogChannelId = menuInteraction.values[0];

                if (gameLogChannelId) {
                    db.set(gameLogChannelIdKey, gameLogChannelId);
                    await menuInteraction.reply({ content: `Game Log Channel Set to <#${gameLogChannelId}>` });
                }
            }

            if (menuInteraction.customId === "statuschannel") {
                const statusChannelId = menuInteraction.values[0];

                if (statusChannelId) {
                    db.set(statusChannelIdKey, statusChannelId);
                    await menuInteraction.reply({ content: `Status Channel Set to <#${statusChannelId}>` });
                }
            }

            if (menuInteraction.customId === "whitelistannouncementchannel") {
                const whiteListAnnouncementChannelId = menuInteraction.values[0];

                if (whiteListAnnouncementChannelId) {
                    db.set(whitelistAnnouncementChannelIdKey, whiteListAnnouncementChannelId);
                    await menuInteraction.reply({ content: `Whitelist Announcement Channel Set to <#${whiteListAnnouncementChannelId}>` });
                }
            }

            if (menuInteraction.customId === "whitelistlogchannel") {
                const whiteListLogChannelId = menuInteraction.values[0];

                if (whiteListLogChannelId) {
                    db.set(whitelistLogChannelIdKey, whiteListLogChannelId);
                    await menuInteraction.reply({ content: `Whitelist Announcement Channel Set to <#${whiteListLogChannelId}>` });
                }
            }
        });

        roleSelectionCollector.on("collect", async (menuInteraction) => {
            if (menuInteraction.customId === "whitelistroleid") {
                const whitelistRoleId = menuInteraction.values[0];

                if (whitelistRoleId) {
                    db.set(whitelistRoleIdKey, whitelistRoleId);
                    await menuInteraction.reply({ content: `Whitelist Role Set to @${menuInteraction.guild.roles.cache.get(whitelistRoleId).name}` });
                }
            }
        });
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
    }
}