# Contributing

Device compatibility reports are especially useful. Please include:

- device and OS version;
- browser or installed-PWA mode;
- whether the page used HTTPS;
- the copied diagnostic report;
- the physical action performed and the event received.

Do not attach recordings, photos, chat logs, API keys, cookies, or account identifiers.

Before opening a pull request:

```bash
npm test
node --check src/sense-bridge.js
node --check demo/app.js
```

Keep the core dependency-free. Provider-specific adapters belong in examples rather than the sensor engine.
