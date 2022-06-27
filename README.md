# Twitch Flow

Express server for Twitch's Authorization code grant flow.

- 🔥 Blazing Fast 
- 🪶 Lightweight 
- 👤 Stand-alone 
- ✅ Easy to integrate on existing systems
- ✅ Easy to build upon and expand

> More info on Authorization code grant flow: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth#authorization-code-grant-flow

# Getting Started

## Requirements

- Node.js 18.0.0+ (for the global `fetch` API)
- npm

## Steps

1. Configure `config.json`

```
nano config.json
```

  - Make sure that `express.port` is a port that is reachable from your `twitch.redirectURI`. (*hint hint: nginx config*)
  - Your `twitch.redirectURI` should have a `/authorize` path (e.g. `https://example.com/authorize`). If you need to adjust the path because of conflict with your existing system, make sure you also change `server.js:30` accordingly.
  
  ```diff
  - app.get("/authorize", async (req, res) => {
  + app.get("/YOUR_NEW_PATH", async (req, res) => {
  ```

2. Install node modules

```
npm i
```

3. Start the server

```
npm start
```

4. Whenever a user grants authorization to your app, the following will be printed in stdout:

```bash
Response from Twitch OK:
{
  access_token: 'foobar',
  expires_in: 13213,
  refresh_token: 'barbaz',
  scope: [ 'channel:read:subscriptions' ],
  token_type: 'bearer'
}
```

and it will also be written to a `token.json` file that looks like this:

```json
{
	"accessToken": "foobar",
	"refreshToken": "barbaz",
	"expiresIn": 0,
	"obtainmentTimestamp": 0
}
```

5. @twurple/auth

https://twurple.js.org/docs/auth/providers/refreshing.html

You can then optionally use these tokens with twurple.