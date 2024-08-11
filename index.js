const express = require('express');
const TorrentClient = require('./class/MagnetClient');
const { hasher, info, turrentstore, streamlink } = require('./class/MagnetClient');

const app = express();

app.get('/get-stream-link', async (req, res) => {
    const { magnet } = req.query;

    if (!magnet) {
        return res.status(400).json({ error: 'Magnet link is required' });
    }
    const hash = await hasher(magnet);
    if (!hash) {
        return res.status(400).json({ error: 'Invalid magnet link' });
    }

    const torrentInfo = await info(hash);

    if (torrentInfo.api && torrentInfo.apikey && torrentInfo.token) {
        const status = await turrentstore(hash, new URL(torrentInfo.api).host, torrentInfo.token, torrentInfo.apikey);

        if (status) {
            const files = await streamlink(new URL(torrentInfo.api).host, torrentInfo.api, hash, torrentInfo.token, torrentInfo.apikey);

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

