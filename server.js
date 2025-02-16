const prerender = require('prerender');
const prMemoryCache = require('prerender-memory-cache');

const chromeFlags = ['--no-sandbox', '--headless', '--disable-gpu', '--remote-debugging-port=9222', '--hide-scrollbars', '--disable-dev-shm-usage']

if (process.env.PROXY_SERVER) {
    chromeFlags.push(`--proxy-server=${process.env.PROXY_SERVER}`)
}

const server = prerender({
    chromeFlags,
    forwardHeaders: true,
    chromeLocation: '/usr/bin/chromium-browser'
});

const memCache = Number(process.env.MEMORY_CACHE) || 0;
if (memCache === 1) {
    server.use(prMemoryCache);
}

server.use({
    requestReceived: (req, res, next) => {
        const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS && process.env.ALLOWED_DOMAINS.split(',')) || [];

        if (ALLOWED_DOMAINS.some((domain) => new RegExp(`^([a-z]+\.)?${domain.replace('.', '\.')}$`).test(domain))) {
            next();
        } else {
            res.send(404);
        }
    }
});
server.use(prerender.httpHeaders());
server.use(prerender.removeScriptTags());

server.start();
