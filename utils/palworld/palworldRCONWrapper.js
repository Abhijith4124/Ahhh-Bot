const RCONClient = require("../rcon/client");

async function getServerInfo(host, port, password) {
    try {
        const client = new RCONClient(host, port);

        await client.connect(password || "");
        const serverInfo = await client.sendCommand("Info");
        client.disconnect();

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
            data: {
                serverName: serverNameResponse,
                serverVersion: serverVersionResponse
            }
        }
    }catch (e) {
        return {
            status: "failed"
        }
    }
}

async function getServerPlayersInfo(host, port, password) {
    try {
        const client = new RCONClient(host, port);

        await client.connect(password || "");
        const serverInfo = await client.sendCommand("ShowPlayers");
        client.disconnect();

        const serverPlayersResponse = serverInfo.toString();

        const playerlist = parseCSV(
            // eslint-disable-next-line no-control-regex
            serverPlayersResponse.toString().replace(/\u0000/g, "")
        ).filter(x => x.playeruid);

        return {
            status: "success",
            data: {
                playerList: playerlist
            }
        }
    }catch (e) {
        return {
            status: "failed"
        }
    }
}

async function kickPlayer(host, port, password, playerSteamId) {
    try {
        const client = new RCONClient(host, port);

        await client.connect(password || "");
        await client.sendCommand("KickPlayer " + playerSteamId);
        client.disconnect();

        return {
            status: "success",
        }
    }catch (e) {
        console.error(e)
        return {
            status: "failed"
        }
    }
}

async function banPlayer(host, port, password, playerSteamId) {
    try {
        const client = new RCONClient(host, port);

        await client.connect(password || "");
        await client.sendCommand("BanPlayer " + playerSteamId);
        client.disconnect();

        return {
            status: "success",
        }
    }catch (e) {
        console.error(e)
        return {
            status: "failed"
        }
    }
}

async function broadcastMessage(host, port, password, message) {
    try {
        const client = new RCONClient(host, port);

        await client.connect(password || "");
        await client.sendCommand("Broadcast  " + message.replaceAll(" ", "_"));
        client.disconnect();

        return {
            status: "success",
        }
    }catch (e) {
        console.error(e)
        return {
            status: "failed"
        }
    }
}

async function saveServer(host, port, password) {
    try {
        const client = new RCONClient(host, port);

        await client.connect(password || "");
        await client.sendCommand("Save");
        client.disconnect();

        return {
            status: "success",
        }
    }catch (e) {
        console.error(e)
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