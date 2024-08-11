const axios = require('axios');
const base64 = require('base-64');
const cheerio = require('cheerio');


class MagnetClient {
    constructor(magnet) {
        this.hash = this.hasher(magnet);
        this.webtor = 'https://webtor.io';
        this.files = null;
    }

    hasher(magnet) {
        const hashMatch1 = magnet.match(/urn:btih:(.*?)&/);
        const hashMatch2 = magnet.match(/urn:btih:([0-9a-fA-F]+)/);

        if (hashMatch1 && hashMatch1[1].length === 40) {
            return hashMatch1[1].toLowerCase();
        }

        if (hashMatch2 && hashMatch2[1].length === 40) {
            return hashMatch2[1].toLowerCase();
        }

        return null;
    }

    async info() {
        try {
            const response = await axios.get(this.webtor);
            const src = response.data;

            const token = src.match(/window\.__TOKEN__ = '(.*?)';/)[1];
            const config = src.match(/window\.__CONFIG__ = '(.*?)';/)[1];
            const info = JSON.parse(base64.decode(config));

            return {
                token,
                api: info.sdk.apiUrl,
                apikey: info.sdk.apiKey
            };
        } catch (error) {
            return {};
        }
    }

    async turrentstore(hash, host, token, apikey) {
        const urlPull = `https://${host}/store/TorrentStore/Pull`;
        const urlTouch = `https://${host}/store/TorrentStore/Touch`;

        const headers = {
            "api-key": apikey,
            "Content-Type": "application/grpc-web+proto",
            "token": token
        };

        try {
            const responsePull = await axios.post(urlPull, hash, { headers });
            if (responsePull.status === 200) {
                const responseTouch = await axios.post(urlTouch, hash, { headers });
                return responseTouch.status === 200;
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    async streamlink(host, api, hash, token, apikey) {
        const listTorrents = [];

        try {
            const response = await axios.get(`${api}/subdomains.json?infohash=${hash}&use-bandwidth=false&use-cpu=true&skip-active-job-search=false&pool=seeder&token=${token}&api-key=${apikey}`);

            for (const subdomain of response.data) {
                const embedUrl = `https://${subdomain}.${host}/${hash}/?token=${token}&api-key=${apikey}`;
                try {
                    const embedResponse = await axios.get(embedUrl);
                    if (embedResponse.status === 200) {
                        const $ = cheerio.load(embedResponse.data);
                        $('a').each((i, element) => {
                            const href = $(element).attr('href');
                            if (href && (href.includes('.mp4') || href.includes('.mkv') || href.includes('.avi'))) {
                                const name = decodeURIComponent(href.split('?')[0].split('/').pop());
                                const stream = `https://${subdomain}.${host}/${hash}/${href}`;
                                if (!name.toLowerCase().includes('1xbet')) {
                                    listTorrents.push({ name, stream });
                                }
                            }
                        });
                        break;
                    }
                } catch (error) {
                    // Continue on error
                }
            }

            return listTorrents.length > 0 ? listTorrents : null;
        } catch (error) {
            return null;
        }
    }
}

module.exports = MagnetClient;