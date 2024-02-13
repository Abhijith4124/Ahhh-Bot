const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const config = require('../../config.json');
const {PermissionFlagsBits} = require("discord-api-types/v10");

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

        const db = interaction.client.db;
        const guildId = interaction.guild.id;

        const whitelistedPlayersListKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
        let whitelistedPlayers = db.get(whitelistedPlayersListKey);

        if (!whitelistedPlayers) {
            whitelistedPlayers = [];
        }

        if (whitelistedPlayers.find(player => player.steamid === steamId && player.playeruid === playerUid)) {
            const alreadyWhitelistedEmbed = new EmbedBuilder()
                .setColor(0x0099FF).setTitle(`Player already whitelisted!`).setDescription(`${inGameName} is already whitelisted`);
            await interaction.editReply({ embeds: [alreadyWhitelistedEmbed] });
            return;
        }

        whitelistedPlayers.push({ name: inGameName, steamid: steamId, playeruid: playerUid, discorduser: discordUser });
        db.set(whitelistedPlayersListKey, whitelistedPlayers);

        const whitelistAnnouncementChannelIdKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistAnnouncementChannelId`;
        const whitelistRoleIdKey = `${guildId}_${serverName.replaceAll(" ", "_")}_WhitelistRoleId`;

        const whitelistAnnouncementChannelId = db.get(whitelistAnnouncementChannelIdKey);
        const whitelistRoleId = db.get(whitelistRoleIdKey);

        const whitelistedEmbed = new EmbedBuilder()
            .setColor(0x0099FF).setTitle("Player Whitelisted!").setDescription(`Player ${inGameName} has been whitelisted for the server ${serverName}`);
        interaction.editReply({ embeds:[whitelistedEmbed] })

        if (whitelistAnnouncementChannelId) {
            const announcementChannel = await interaction.client.channels.cache.get(whitelistAnnouncementChannelId);
            if (announcementChannel && whitelistRoleId && discordUser) {
                const role = interaction.guild.roles.cache.get(whitelistRoleId);
                if (role) {
                    let guildUser = await interaction.guild.members.fetch(discordUser);
                    await guildUser.roles.add(role);
                }
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
    
                await announcementChannel.send({ embeds: [whitelistedAnnouncementEmbed] });
            }
        }
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