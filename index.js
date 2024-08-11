const express = require('express');
const TorrentClient = require('./class/TorrentClient');

const app = express();

app.get('/get-stream-link', async (req, res) => {
    const { magnet } = req.query;

    if (!magnet) {
        return res.status(400).json({ error: 'Magnet link is required' });
    }

    const torrentClient = new TorrentClient(magnet);

    if (!torrentClient.hash) {
        return res.status(400).json({ error: 'Invalid magnet link' });
    }

    const info = await torrentClient.info();

    if (info.api && info.apikey && info.token) {
        const status = await torrentClient.turrentstore(torrentClient.hash, new URL(info.api).host, info.token, info.apikey);

        if (status) {
            const files = await torrentClient.streamlink(new URL(info.api).host, info.api, torrentClient.hash, info.token, info.apikey);

            if (files) {
                return res.json({ files });
            }
        }
    }

    return res.status(500).json({ error: 'Failed to retrieve stream link' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

