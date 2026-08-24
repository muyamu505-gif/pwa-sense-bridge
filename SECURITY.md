# Security and privacy

PWA Sense Bridge processes microphone amplitude and motion samples locally. It does not contain a network client and does not upload recordings, photos, sensor samples, or model messages by itself.

Applications integrating the bridge are responsible for:

- requesting permissions only after a clear user action;
- explaining which semantic events are sent to a server;
- rate-limiting events before forwarding them to an LLM;
- never treating sensor events as authentication or proof of physical presence;
- validating and size-limiting camera files before upload.

Please report security issues privately to the repository owner rather than opening a public exploit report.
