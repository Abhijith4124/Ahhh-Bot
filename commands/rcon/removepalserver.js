const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("removepalserver")
        .setDescription("Remove Your PalWorld Server")
        .addStringOption(option =>
            option.setName("server")
                .setDescription("The server you want to remove")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const removeServerResponseEmbed = new EmbedBuilder()
            .setColor(0x0099FF);

        const db = interaction.client.db;

        const serverName = interaction.options.getString("server");

        //Removing from the Guild Servers List
        const guildServersKey = `${interaction.guild.id}_PalServers`;
        let guildServers = db.get(guildServersKey);

        if (!guildServers || guildServers.length < 1) {
            removeServerResponseEmbed.setTitle("Server Does not Exist");
            removeServerResponseEmbed.setDescription("You have no servers added to remove.");
            await interaction.reply({ embeds: [removeServerResponseEmbed] });
            return;
        }

        const serverIndex = guildServers.findIndex(server => server.serverName === serverName);

        if (serverIndex === -1) {
            removeServerResponseEmbed.setTitle(`${serverName} Does not Exist`);
            removeServerResponseEmbed.setDescription("You have no servers added to remove.");
            await interaction.reply({ embeds: [removeServerResponseEmbed] });
            return;
        }

        guildServers.splice(serverIndex, 1);
        db.set(guildServersKey, guildServers);

        //Removing from the global Servers List
        let palServers = db.get("PalServers");
        if (palServers) {
            let guildPalServersIndex = palServers.indexOf(guildServersKey);
            if (guildPalServersIndex !== -1) {
                palServers.splice(guildPalServersIndex, 1);
                db.set("PalServers", palServers);
            }
        }

        //Removing the Status Channel value
        const statusChannelKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_StatusChannelId`;
        const statusChannelId = db.get(statusChannelKey);

        if (statusChannelId) {
            const statusMessageIdKey = `${statusChannelId}_${serverName.replaceAll(" ", "_")}_StatusMessageId`;
            let statusMessageId = db.get(statusMessageIdKey);

            if (statusMessageId) {
                try {
                    let statusMessage = await interaction.client.channels.cache.get(statusChannelId).messages.fetch(statusMessageId);
                    if (statusMessage) {
                        statusMessage.delete();
                    }
                }catch (e) {
                    console.error(e);
                }
            }

            db.delete(statusMessageIdKey);
        }

        db.delete(statusChannelKey)

        //Removing Server Data
        const serverDataKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_ServerData`;
        const serverWhitelistData = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
        const guildPalServerWhitelistEnabledKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_PalServerWhitelistEnabled`;

        const gameLogChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_GameLogChannelId`;
        const statusChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_StatusChannelId`;
        const whitelistAnnouncementChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistAnnouncementChannelId`;
        const whitelistLogChannelIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistLogChannelId`;
        const whitelistRoleIdKey = `${interaction.guild.id}_${serverName.replaceAll(" ", "_")}_WhitelistRoleId`;

        db.delete(gameLogChannelIdKey);
        db.delete(statusChannelIdKey);
        db.delete(whitelistAnnouncementChannelIdKey);
        db.delete(whitelistLogChannelIdKey);
        db.delete(whitelistRoleIdKey);

        db.delete(guildPalServerWhitelistEnabledKey);
        db.delete(serverWhitelistData);
        db.delete(serverDataKey);

        removeServerResponseEmbed.setTitle(`${serverName} has been Removed!`);
        removeServerResponseEmbed.setDescription(`You have successfully removed the server ${serverName}.`);

        await interaction.reply({ embeds: [removeServerResponseEmbed] });
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