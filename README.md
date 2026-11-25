<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/brand/brainlife-mark-on-dark.svg">
    <img src=".github/brand/brainlife-mark-on-light.svg" alt="brainlife.io" width="140">
  </picture>
</p>

<h1 align="center">event</h1>

<p align="center">
  Live updates for brainlife.io: AMQP messages to the browser over WebSocket, with JWT access checks.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-maintained-blue.svg" alt="Status: maintained">
  <a href="https://brainlife.io"><img src="https://img.shields.io/badge/brainlife.io-site-3b9fd0.svg" alt="brainlife.io"></a>
  <a href="https://brainlife.io/docs"><img src="https://img.shields.io/badge/Docs-brainlife.io%2Fdocs-005981.svg" alt="Documentation"></a>
  <a href="https://doi.org/10.1038/s41592-024-02237-2"><img src="https://img.shields.io/badge/DOI-10.1038%2Fs41592--024--02237--2-e57536.svg" alt="Nature Methods paper"></a>
</p>

## 🧠 At a glance

| | |
|---|---|
| 🧭 **What** | WebSocket gateway: clients subscribe to AMQP exchanges/keys (for example amaretti task events); each bind is checked with the source service using the user's JWT. Also sends email notifications on events |
| 🧱 **Stack** | Node.js · Express (`express-ws`) · AMQP · pm2 |
| 🔌 **Talks to** | RabbitMQ; [amaretti-next](https://github.com/brainlife/amaretti-next) and [warehouse-next](https://github.com/brainlife/warehouse-next) (publish events, check access); [auth-next](https://github.com/brainlife/auth-next) (JWT public key, user email) |
| 🌐 **Endpoint** | `wss://brainlife.io/api/event/subscribe?jwt=…` |
| 📖 **API docs** | [`docs/apidoc`](docs/apidoc) (generated with `npm run apidoc`) |

## 🚀 Quick start

```bash
git clone https://github.com/brainlife/event && cd event
npm install
cp api/config/index.js.dev api/config/index.js    # AMQP URL, exchanges, auth public key
npm start                                         # node api/event.js; GET /health
```

The [`Dockerfile`](Dockerfile) runs `api/event.js` under `pm2-runtime`; the full stack is composed in [brainlife/brainlife](https://github.com/brainlife/brainlife). Tests: `npm test` (mocha).

## 📡 Subscribing from a client

```javascript
const ws = new ReconnectingWebSocket("wss://brainlife.io/api/event/subscribe?jwt=" + jwt);
ws.onopen = () => ws.send(JSON.stringify({ bind: { ex: "wf", key: "task." + instanceId + ".#" } }));
ws.onmessage = (e) => { const task = JSON.parse(e.data).msg; console.log(task._id, task.status); };
```

<details>
<summary><b>🔔 Notifications</b></summary>

`POST /api/event/notification/` (with `Authorization: Bearer <jwt>`) asks the service to act when an event happens:

```json
{
  "event": "wf.task.finished",
  "handler": "email",
  "config": { "task_id": "1234567abc", "subject": "Email subject", "message": "Your workflow has completed!" }
}
```

Only `wf.task.finished` (needs `task_id`) and the `email` handler (needs `subject` and `message`) are supported. The recipient's address is looked up through the auth service.

</details>

<details>
<summary><b>🔐 Server-side access checks</b></summary>

Each exchange in the config has a function that decides whether the user may bind to a key, usually by calling the source service with the user's JWT:

```javascript
exports.event = {
    exchanges: {
        wf: function(req, key, cb) {
            request.get({
                url: brlife_host + "/api/wf/event/checkaccess/" + key,
                json: true,
                headers: { 'Authorization': 'Bearer ' + req.query.jwt }
            }, (err, res, body) => cb(err, body.status == "ok"));
        },
        // open an exchange to everyone (no JWT):
        public: (req, key, cb) => cb(null, true),
    }
};
```

The access-check URL and key format are specific to each event source; see its documentation (for example the [amaretti API docs](https://brainlife.github.io/amaretti/)).

</details>

## 🔗 Related repositories

| Repository | Role |
|---|---|
| [amaretti-next](https://github.com/brainlife/amaretti-next) | Publishes task events |
| [warehouse-next](https://github.com/brainlife/warehouse-next) | Publishes dataset and rule events |
| [brainlife-lite](https://github.com/brainlife/brainlife-lite) | Subscribes for live updates |

## 👥 Authors

Soichi Hayashi and the brainlife.io team.

## 📚 Citing

If you use brainlife.io in your work, please cite:

> Hayashi S, Caron BA, Heinsfeld AS, et al. brainlife.io: a decentralized and open-source cloud platform to support neuroscience research. *Nature Methods* 21:809–813 (2024). [doi:10.1038/s41592-024-02237-2](https://doi.org/10.1038/s41592-024-02237-2)

## 💰 Funding

brainlife.io is developed by the Pestilli Lab at The University of Texas at Austin and is publicly funded; acknowledging that support helps keep it running.

<details>
<summary>Grants (verified list, from <a href="https://github.com/brainlife/ezbids/blob/master/CREDITS.md#funding">ezbids CREDITS.md</a>)</summary>

| Funder | Award | Title |
|---|---|---|
| NIH NINDS | [U24NS140384](https://reporter.nih.gov/project-details/U24NS140384) | BRAIN CONNECTS: The Axonal Projectome EXchange (APEX) |
| NIH NIMH | [R01MH126699](https://reporter.nih.gov/project-details/R01MH126699) | Community-driven development of BIDS |
| NIH NIBIB | [R01EB030896](https://reporter.nih.gov/project-details/R01EB030896) | CRCNS US-France: open science and cloud computing of MEEG |
| NIH NIBIB | [R01EB029272](https://reporter.nih.gov/project-details/R01EB029272) | CRCNS US-France: lowering the barrier of entry to network neuroscience |
| NSF | [BCS-1636893](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1636893), [2148729](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2148729) | BD Spokes: Advanced Computational Neuroscience Network |
| NSF | [BCS-1734853](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1734853), [2203524](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2203524) | NCS-FO: Connectome mapping algorithms |
| NSF | [IIS-1912270](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1912270), [2148700](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2148700) | CRCNS US-German: DataLad |
| NSF | [ACI-1916518](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1916518) | BD Hubs: Midwest Big Data Hub |
| Wellcome Trust | [226486](https://grantnav.threesixtygiving.org/grant/360G-Wellcome-226486_Z_22_Z) | Developing an international governance framework to advance global brain and mental health data equity and innovation |

</details>

## 🤝 Contributing

Issues and pull requests are welcome in this repository. For help using brainlife.io, see the [documentation](https://brainlife.io/docs).

## ⚖️ License

This repository does not include a license file yet.

<p align="center"><sub>brainlife.io · Brain data across scales. One place to analyze, share and publish it. · The University of Texas at Austin</sub></p>
