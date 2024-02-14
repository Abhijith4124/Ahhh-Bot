const {REST, Routes} = require("discord.js");
const config = require("../../config.json");


const rest = new REST().setToken(config.token);
async function deployCommands(client) {
    try {
        console.log(`Started refreshing ${client.commands.size} application (/) commands.`);
        await rest.put(Routes.applicationCommands(config.botApplicationId), { body: client.commands.map(command => command.data.toJSON()) });
        console.log(`Deployed New Commands`)
    }catch (e) {
        console.error(e)
    }
}

async function deleteCommands(client) {
    try {
        await rest.put(Routes.applicationCommands(config.botApplicationId), { body: [] });
        console.log('Successfully deleted all application commands.')
    }catch (e) {
        console.error(e)
    }
}

module.exports = {deployCommands, deleteCommands}