const {EmbedBuilder} = require("discord.js");

async function whitelistPlayer(interaction, data) {
    try {
        const db = interaction.client.db;
        const guildId = interaction.guild.id;

        const whitelistedPlayersListKey = `${guildId}_${data.serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
        let whitelistedPlayers = db.get(whitelistedPlayersListKey);

        if (!whitelistedPlayers) {
            whitelistedPlayers = [];
        }

        if (whitelistedPlayers.find(player => player.steamid === data.steamId && player.playeruid === data.playerUid)) {
            const alreadyWhitelistedEmbed = new EmbedBuilder()
                .setColor(0x0099FF).setTitle(`Player already whitelisted!`).setDescription(`${data.inGameName} is already whitelisted`);
            await interaction.editReply({ embeds: [alreadyWhitelistedEmbed] });
            return;
        }

        whitelistedPlayers.push({ name: data.inGameName, steamid: data.steamId, playeruid: data.playerUid, discorduser: data.discordUser });
        db.set(whitelistedPlayersListKey, whitelistedPlayers);

        const whitelistAnnouncementChannelIdKey = `${guildId}_${data.serverName.replaceAll(" ", "_")}_WhitelistAnnouncementChannelId`;
        const whitelistRoleIdKey = `${guildId}_${data.serverName.replaceAll(" ", "_")}_WhitelistRoleId`;

        const whitelistAnnouncementChannelId = db.get(whitelistAnnouncementChannelIdKey);
        const whitelistRoleId = db.get(whitelistRoleIdKey);

        const whitelistedEmbed = new EmbedBuilder()
            .setColor(0x0099FF).setTitle("Player Whitelisted!").setDescription(`Player ${data.inGameName} has been whitelisted for the server ${data.serverName}`);
        await interaction.editReply({ embeds:[whitelistedEmbed] })

        if (whitelistAnnouncementChannelId) {
            const announcementChannel = await interaction.client.channels.cache.get(whitelistAnnouncementChannelId);
            if (announcementChannel && data.discordUser) {
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

                await announcementChannel.send({ content: `${data.discordUser}`, embeds: [whitelistedAnnouncementEmbed] });

                if (whitelistRoleId) {
                    const role = interaction.guild.roles.cache.get(whitelistRoleId);
                    if (role) {
                        let guildUser = await interaction.guild.members.fetch(data.discordUser);
                        await guildUser.roles.add(role);
                    }
                }
            }
        }
    }catch (e) {
        console.error(e)
    }
}

async function removeWhitelist(interaction, data) {
    try {
        const db = interaction.client.db;
        const guildId = interaction.guild.id;

        const whitelistedPlayersListKey = `${guildId}_${data.serverName.replaceAll(" ", "_")}_WhitelistedPlayerList`;
        const whitelistRoleIdKey = `${guildId}_${data.serverName.replaceAll(" ", "_")}_WhitelistRoleId`;

        const whitelistRoleId = db.get(whitelistRoleIdKey);

        let whitelistedPlayers = db.get(whitelistedPlayersListKey);

        if (!whitelistedPlayers) {
            whitelistedPlayers = [];
        }

        let whitelistedPlayerIndex = whitelistedPlayers.findIndex(player => player.name === data.playerName);

        if (whitelistedPlayerIndex === -1) {
            await interaction.editReply({ content: "Player is not whitelisted" });
            return;
        }

        let whitelistedPlayer = whitelistedPlayers[whitelistedPlayerIndex];

        whitelistedPlayers.splice(whitelistedPlayerIndex, 1);
        db.set(whitelistedPlayersListKey, whitelistedPlayers);

        if (whitelistRoleId && data.discordUser) {
            const role = interaction.guild.roles.cache.get(whitelistRoleId);
            if (role) {
                let guildUser = await interaction.guild.members.fetch(data.discordUser);
                await guildUser.roles.remove(role);
            }
        }

        const playerRemovedFromWhitelistEmbed = new EmbedBuilder()
            .setColor(0x0099FF).setTitle("Player Whitelist Removed!").setDescription(`Player ${whitelistedPlayer.name ? whitelistedPlayer.name : ""} has been removed from the whitelist for server ${data.serverName}`);
        await interaction.editReply({ embeds: [playerRemovedFromWhitelistEmbed] });
    }catch (e) {
        console.error(e)
    }
}

module.exports = {whitelistPlayer, removeWhitelist}