const {REST, Routes} = require("discord.js");


const rest = new REST().setToken(process.env.TOKEN);
async function deployCommandsToGuild(client, guildId) {
    try {
        if (process.env.DEBUG) {
            console.log(`Started refreshing ${client.commands.size} application (/) commands.`);
        }

        await rest.put(Routes.applicationGuildCommands(process.env.BOT_APPLICATION_ID, guildId), { body: client.commands.map(command => command.data.toJSON()) });

        if (process.env.DEBUG) {
            console.log(`Deployed New Commands`)
        }
    }catch (e) {
        console.error(e)
    }
}

async function deleteCommandsFromGuild(client, guildId) {
    try {
        await rest.put(Routes.applicationGuildCommands(process.env.BOT_APPLICATION_ID, guildId), { body: [] });
        if (process.env.DEBUG) {
            console.log('Successfully deleted all application commands.')
        }
    }catch (e) {
        console.error(e)
    }
}

module.exports = {deployCommandsToGuild, deleteCommandsFromGuild}