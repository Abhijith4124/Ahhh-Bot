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
    
    try {
        const serverInfoResponse = await getServerInfo(host, RCONPort, password);

        if (serverInfoResponse.status === "failed") {
            const serverAlreadyAddedEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Failed to Add Server')
                .setDescription(`Failed To Add Server ${serverName}. Check the Hostname and Port, also make sure the server is running...`)

            await interaction.editReply({ embeds: [serverAlreadyAddedEmbed] });
            return;
        }

        const serverVersionResponse = serverInfoResponse.data.serverVersion;
        const serverNameResponse = serverInfoResponse.data.serverName;

        const guildPalServersKey = `${interaction.guild.id}_PalServers`;

        let guildPalServers = db.get(guildPalServersKey);
        if (!guildPalServers) {
            guildPalServers = [];
        }

        //Check if the server is already added
        if (guildPalServers.some(server => server.serverName === serverName)) {
            const serverAlreadyAddedEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Server Added')
                .setDescription(`Your PalWorld Server ${serverName} has already been added.`)

            await interaction.editReply({ embeds: [serverAlreadyAddedEmbed] });
            return;
        }

        //Add the Server to the Server List
        guildPalServers.push({
            serverName: serverName,
            host: host,
            port: port,
            RCONPort: RCONPort,
            password: password
        });

        db.set(guildPalServersKey, guildPalServers);

        //Add the User Server List to PalServers List to later track via RCON Service
        let palServers = db.get("PalServers");
        if (!palServers) {
            palServers = [];
        }
        const guildPalServerKeyIndex = palServers.indexOf(guildPalServersKey);
        if (guildPalServerKeyIndex === -1) {
            palServers.push(guildPalServersKey);
        }
        db.set("PalServers", palServers);

        const serverAddedEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Server Added')
            .setDescription(`Your PalWorld Server ${serverName} has been added.`)
            .addFields({ name: "Server Name", value: serverNameResponse }, { name: "Server Version", value: serverVersionResponse })

        await interaction.editReply({ embeds: [serverAddedEmbed] });
    }catch (e) {
        const serverFailedToAddEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Failed To Add Server')
            .setDescription(`Check Your Host and Port Number, Make Sure the Server is On and the Password is Correct.`)

        await interaction.editReply({ embeds: [serverFailedToAddEmbed] });
    }
}

module.exports = {
    handleModal
}