const { Rcon } = require('minecraft-rcon-client')
const config = require('../../config.json');

async function getServerInfo(host, port, password) {
    try {
        let rconClient = new Rcon({
            host: host,
            port: port,
            password: password
        })

        await rconClient.connect();

        let serverInfo = await rconClient.send("Info");
        await rconClient.disconnect();

        const message = serverInfo.toString();
        const parts = message.split("[");

        const serverVersionResponse = parts[1].split("]")[0];

        const serverNameResponse = parts[1]
            .split("]")[1]
            // eslint-disable-next-line no-control-regex
            .replace(/[\n\u0000]+$/, "")
            .trim();

        return {
            status: "success",
            message: "Successfully Fetched Server Info",
            serverInfo: {
                serverName: serverNameResponse,
                serverVersion: serverVersionResponse
            }
        }
    }catch (e) {
        if (config.debug) {
            console.log(`[RCON]: Error: ${e}`)
        }

        return {
            status: "failed"
        }
    }
}

async function getServerPlayersInfo(host, port, password) {
    try {
        let rconClient = new Rcon({
            host: host,
            port: port,
            password: password
        })

        await rconClient.connect();

        let playersInfo =  await rconClient.send(`ShowPlayers`);
        await rconClient.disconnect();

        const serverPlayersResponse = playersInfo.toString();

        const playerlist = parseCSV(
            // eslint-disable-next-line no-control-regex
            serverPlayersResponse.toString().replace(/\u0000/g, "")
        ).filter(x => x.playeruid);

        return {
            status: "success",
            message: "Successfully Fetched Player List",
            data: {
                playerList: playerlist
            }
        }
    }catch (e) {
        if (config.debug) {
            console.log(`[RCON]: Error: ${e}`)
        }

        return {
            status: "failed"
        }
    }
}

async function kickPlayer(host, port, password, playerSteamId) {
    try {
        let rconClient = new Rcon({
            host: host,
            port: port,
            password: password
        });

        await rconClient.connect();

        await rconClient.send(`KickPlayer ${playerSteamId}`);
        await rconClient.disconnect();

        return {
            status: "success",
            message: `Successfully Kicked Player ${playerSteamId}`
        }
    }catch (e) {
        if (config.debug) {
            console.log(`[RCON]: Error: ${e}`)
        }

        return {
            status: "failed"
        }
    }
}

async function banPlayer(host, port, password, playerSteamId) {
    try {
        let rconClient = new Rcon({
            host: host,
            port: port,
            password: password
        });

        await rconClient.connect();

        await rconClient.send(`BanPlayer ${playerSteamId}`);
        await rconClient.disconnect();

        return {
            status: "success",
            message: `Successfully Banned Player ${playerSteamId}`
        }
    }catch (e) {
        if (config.debug) {
            console.log(`[RCON]: Error: ${e}`)
        }

        return {
            status: "failed"
        }
    }
}

async function broadcastMessage(host, port, password, message) {
    try {
        let rconClient = new Rcon({
            host: host,
            port: port,
            password: password
        });

        await rconClient.connect();

        await rconClient.send(`Broadcast ${message.replaceAll(" ", "_")}`);
        await rconClient.disconnect();

        return {
            status: "success",
            message: `Broadcasted Message: ${message}`
        }
    }catch (e) {
        if (config.debug) {
            console.log(`[RCON]: Error: ${e}`)
        }

        return {
            status: "failed"
        }
    }
}

async function saveServer(host, port, password) {
    try {
        let rconClient = new Rcon({
            host: host,
            port: port,
            password: password
        });

        await rconClient.connect();

        await rconClient.send(`Save`);
        await rconClient.disconnect();

        return {
            status: "success",
            message: `Successfully Saved Server`
        }
    }catch (e) {
        if (config.debug) {
            console.log(`[RCON]: Error: ${e}`)
        }

        return {
            status: "failed"
        }
    }
}

function parseCSV(csvData) {
    const lines = csvData.trim().split("\n");
    const headers = lines
        .shift()
        .split(",")
        .map(header => header.trim());
    const result = lines.map(line => {
        const values = line.split(",").map(value => value.trim());
        return headers.reduce((object, header, index) => {
            object[header] = values[index];
            return object;
        }, {});
    });
    return result;
}

module.exports = {getServerInfo, getServerPlayersInfo, broadcastMessage, saveServer, kickPlayer, banPlayer}