const {REST, Routes} = require("discord.js");
const config = require("../../config.json");


const rest = new REST().setToken(config.token);
async function deployCommandsToGuild(client, guildId) {
    try {
        if (config.debug) {
            console.log(`Started refreshing ${client.commands.size} application (/) commands.`);
        }

        await rest.put(Routes.applicationGuildCommands(config.botApplicationId, guildId), { body: client.commands.map(command => command.data.toJSON()) });

        if (config.debug) {
            console.log(`Deployed New Commands`)
        }
    }catch (e) {
        console.error(e)
    }
}

async function deleteCommandsFromGuild(client, guildId) {
    try {
        await rest.put(Routes.applicationGuildCommands(config.botApplicationId, guildId), { body: [] });
        if (config.debug) {
            console.log('Successfully deleted all application commands.')
        }
    }catch (e) {
        console.error(e)
    }
}

module.exports = {deployCommandsToGuild, deleteCommandsFromGuild}