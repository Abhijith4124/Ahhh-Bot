const { Rcon } = require('minecraft-rcon-client')
const config = require('../../config.json');

async function getServerInfo(host, port, password) {
    return await new Promise(async (resolve) => {
        try {
            setTimeout(() => {
                resolve({
                    status: "failed"
                })
            }, 2000);

            let rconClient = new Rcon({
                host: host,
                port: port,
                password: password
            });

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

            resolve({
                status: "success",
                message: "Successfully Fetched Server Info",
                serverInfo: {
                    serverName: serverNameResponse,
                    serverVersion: serverVersionResponse
                }
            });
        }catch (e) {
            if (config.debug) {
                console.log(`[RCON]: Error: ${e}`)
            }

            resolve({
                status: "failed"
            })
        }
    });
}

async function getServerPlayersInfo(host, port, password) {
    return await new Promise(async (resolve) => {
        try {
            setTimeout(() => {
                resolve({
                    response: "failed"
                })
            }, 2000);

            let rconClient = new Rcon({
                host: host,
                port: port,
                password: password
            })

            await rconClient.connect();

            let playersInfo = await rconClient.send(`ShowPlayers`);
            await rconClient.disconnect();

            const serverPlayersResponse = playersInfo.toString();

            const playerlist = parseCSV(
                // eslint-disable-next-line no-control-regex
                serverPlayersResponse.toString().replace(/\u0000/g, "")
            ).filter(x => x.playeruid);

            resolve({
                status: "success",
                message: "Successfully Fetched Player List",
                data: {
                    playerList: playerlist
                }
            });
        }catch (e) {
            if (config.debug) {
                console.log(`[RCON]: Error: ${e}`)
            }

            resolve({
                status: "failed"
            });
        }
    });
}

async function kickPlayer(host, port, password, playerSteamId) {
    return await new Promise(async (resolve) => {
        try {
            setTimeout(() => {
                resolve({
                    response: "failed"
                });
            }, 2000);

            let rconClient = new Rcon({
                host: host,
                port: port,
                password: password
            });

            await rconClient.connect();

            await rconClient.send(`KickPlayer ${playerSteamId}`);
            await rconClient.disconnect();

            resolve({
                status: "success",
                message: `Successfully Kicked Player ${playerSteamId}`
            });
        }catch (e) {
            if (config.debug) {
                console.log(`[RCON]: Error: ${e}`)
            }

            resolve({
                status: "failed"
            });
        }
    });
}

async function banPlayer(host, port, password, playerSteamId) {
    return await new Promise(async (resolve) => {
        try {
            setTimeout(() => {
                resolve({
                    response: "failed"
                });
            }, 2000);

            let rconClient = new Rcon({
                host: host,
                port: port,
                password: password
            });

            await rconClient.connect();

            await rconClient.send(`BanPlayer ${playerSteamId}`);
            await rconClient.disconnect();

            resolve({
                status: "success",
                message: `Successfully Banned Player ${playerSteamId}`
            });
        }catch (e) {
            if (config.debug) {
                console.log(`[RCON]: Error: ${e}`)
            }

            resolve({
                status: "failed"
            });
        }
    });
}

async function broadcastMessage(host, port, password, message) {
    return new Promise(async (resolve) => {
        try {
            setTimeout(() => {
                resolve({
                    status: "failed"
                });
            }, 2000);

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

            resolve({
                status: "failed"
            });
        }
    });
}

async function saveServer(host, port, password) {
    return new Promise(async (resolve) => {
        try {
            setTimeout(() => {
                resolve({
                    status: "failed"
                })
            }, 2000);

            let rconClient = new Rcon({
                host: host,
                port: port,
                password: password
            });

            await rconClient.connect();

            await rconClient.send(`Save`);
            await rconClient.disconnect();

            resolve({
                status: "success",
                message: `Successfully Saved Server`
            });
        }catch (e) {
            if (config.debug) {
                console.log(`[RCON]: Error: ${e}`)
            }

            resolve({
                status: "failed"
            });
        }

    });
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