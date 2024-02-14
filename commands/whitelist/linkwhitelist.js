const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("linkwhitelist")
        .setDescription("Link a Whitelisted Player to a Discord User, it will assign the Whitelisted Role if provided")
        .addStringOption(option =>
            option.setName("servername")
                .setDescription("The server the whitelisted player belongs to")
                .setRequired(true)
                .setAutocomplete(true)
        ).addStringOption(option =>
            option.setName("playername")
                .setDescription("The In Game Name of the player you want to link")
                .setRequired(true)
                .setAutocomplete(true)
        ).addUserOption(option =>
            option.setName("discorduser")
                .setDescription("The Discord User you want to link the player to")
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        await interaction.deferReply();

        const serverName = interaction.options.getString("servername");
        const playerName = interaction.options.getString("playername");
        const discordUser = interaction.options.getUser("discorduser");

        if (!discordUser) {
            await interaction.editReply(`You must provide a Discord User to link the player to.`);
            return;
        }

        const db = interaction.client.db;
        const guildId = interaction.guild.id;

        const whitelistRoleIdKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistRoleId`;
        const whitelistAnnouncementChannelIdKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistAnnouncementChannelId`;

        const whitelistAnnouncementChannelId = db.get(whitelistAnnouncementChannelIdKey);
        const whitelistRoleId = db.get(whitelistRoleIdKey);

        if (!whitelistRoleId) {
            await interaction.editReply(`No Whitelist Role found for server ${serverName}. Please set a whitelist role using /serverconfig`);
            return
        }

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

        if (whitelistedPlayer.discorduser) {
            await interaction.editReply(`Player ${playerName} is already linked to a Discord User`);
            return;
        }

        whitelistedPlayer.discorduser = discordUser;

        whitelistedPlayers[whitelistedPlayerIndex] = whitelistedPlayer;

        db.set(whitelistedPlayersListKey, whitelistedPlayers)

        const role = interaction.guild.roles.cache.get(whitelistRoleId);
        if (!role) {
            await interaction.editReply(`Whitelist Role not found for server ${serverName}`);
            return
        }

        let guildUser = await interaction.guild.members.fetch(discordUser);
        await guildUser.roles.add(role);

        const discordLinkedToPlayerEmbed = new EmbedBuilder()
            .setColor(0x0099FF).setTitle(`Discord Linked to Player!`)
            .setDescription(`Discord User ${discordUser} Linked to Player ${whitelistedPlayer.name}`);
        await interaction.editReply({ embeds: [discordLinkedToPlayerEmbed] });

        if (whitelistAnnouncementChannelId) {
            const announcementChannel = await interaction.client.channels.cache.get(whitelistAnnouncementChannelId);
            if (announcementChannel && discordUser) {
                const whitelistedAnnouncementEmbed = new EmbedBuilder()
                    .setTitle("Welcome to **AHHH World**🌴")
                    .setDescription("Congratulations 🎉")
                    .addFields(
                        {
                            name: "_You have been whitelisted to our Palworld server_ 🦖",
                            value: "Enjoy your stay 🙃",
                            inline: false
                        },
                    )
                    .setImage("https://i.ibb.co/bmKNgq6/In-Shot-20240210-132746448.jpg")
                    .setColor("#24ffff")
                    .setFooter({
                        text: "Ahhh bot",
                    })
                    .setTimestamp();

                await announcementChannel.send({ content: `${discordUser}`, embeds: [whitelistedAnnouncementEmbed] });
            }
        }
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