async function cleanUpServerData(db) {
    try {
        let palServers = db.get("PalServers");

        if (!palServers || palServers.length < 1) {
            if (process.env.DEBUG) {
                console.log(`[CleanUp]: Skipping Server Data Cleanup since no servers are added...`)
            }
            return;
        }

        for (const palServersKey of palServers) {
            const palServerKeySplit = palServersKey.split("_");

            let guildId = palServerKeySplit[0];

            let guildPalServersKey = `${guildId}_PalServers`;
            let guildPalServers = db.get(guildPalServersKey);

            //Looping through each Server added in a Guild aka Server
            for (const guildPalServer of guildPalServers) {
                let serverName = guildPalServer.serverName;

                let defaultServerData = {
                    online: false,
                    currentPlayers: 0,
                    maximumPlayers: 32,
                    peakPlayers: 0,
                    playerList: []
                }

                const serverDataKey = `${guildId}_${serverName.replaceAll(" ", "_")}_ServerData`;
                db.set(serverDataKey, defaultServerData);
            }
        }
    }catch (e) {
        console.error(e);
    }
}

async function cleanUp(db) {
    await cleanUpServerData(db);
}

module.exports = {cleanUp}