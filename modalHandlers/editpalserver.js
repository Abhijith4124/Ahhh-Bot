const {EmbedBuilder} = require("discord.js");
const {getServerInfo} = require("../utils/palworld/palworldRCONWrapper");
async function handleModal(interaction) {

    await interaction.deferReply();

    const db = interaction.client.db;

    const serverName = interaction.fields.getTextInputValue("serverNameInput");
    const host = interaction.fields.getTextInputValue("hostInput");
    const port = interaction.fields.getTextInputValue("portInput");
    const RCONPort = interaction.fields.getTextInputValue("RCONPortInput");
    const password = interaction.fields.getTextInputValue("passwordInput");

    if (!serverName || !host || !port || !RCONPort || !password) {
        await interaction.editReply("You must fill out all the fields.");
        return;
    }

    const guildPalServersKey = `${interaction.guild.id}_PalServers`;

    let guildPalServers = db.get(guildPalServersKey);
    if (!guildPalServers) {
        guildPalServers = [];
    }

    //Check if the server exists to edit
    if (!guildPalServers.some(server => server.serverName === serverName)) {
        const serverAlreadyAddedEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Server Not Found')
            .setDescription(`Your PalWorld Server ${serverName} cannot be found to edit.`)

        await interaction.editReply({ embeds: [serverAlreadyAddedEmbed] });
        return;
    }

    try {
        const serverInfoResponse = await getServerInfo(host, RCONPort, password);

        if (serverInfoResponse.status === "failed") {
            const serverAlreadyEditedEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Failed to Edit Server')
                .setDescription(`Failed To Edit Server ${serverName}. Check the Hostname and Port, also make sure the server is running...`)

            await interaction.editReply({ embeds: [serverAlreadyEditedEmbed] });
            return;
        }

        const serverVersionResponse = serverInfoResponse.data.serverVersion;
        const serverNameResponse = serverInfoResponse.data.serverName;

        //Replace the Server Details
        guildPalServers.splice(guildPalServers.findIndex(server => server.serverName === serverName), 1, {
            serverName: serverName,
            host: host,
            port: port,
            RCONPort: RCONPort,
            password: password
        });

        db.set(guildPalServersKey, guildPalServers);

        const serverEditedEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Server Edited')
            .setDescription(`Your PalWorld Server ${serverName} has been edited.`)
            .addFields({ name: "Server Name", value: serverNameResponse }, { name: "Server Version", value: serverVersionResponse })

        await interaction.editReply({ embeds: [serverEditedEmbed] });
    }catch (e) {
        const serverFailedToEditEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Failed To Edit Server')
            .setDescription(`Check Your Host and Port Number, Make Sure the Server is On and the Password is Correct.`)

        await interaction.editReply({ embeds: [serverFailedToEditEmbed] });
    }
}

module.exports = {
    handleModal
}