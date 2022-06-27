const express = require("express");
const { readFileSync, writeFileSync } = require("fs");
const config = require("./config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const form = readFileSync("./form.html", { encoding: "utf8" });
const success = readFileSync("./success.html", { encoding: "utf8" });
const error = readFileSync("./error.html", { encoding: "utf8" });

// 1. Have the user navigate to this path
app.get("/", (req, res) => {
  res.send(form);
});

// 2. The user will check the scopes they want to give to your app
app.post("/submit", (req, res) => {
  try {
    console.log("User checked these boxes:");
    console.log(req.body);

    // 3. The user will be redirected to Twitch to (log in and) authorize your app with the specified scopes
    const twitchAuthorizationURL = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${config.twitch.clientId}&redirect_uri=${config.twitch.redirectURI}&scope=${Object.keys(req.body).join('+')}`;
    res.redirect(twitchAuthorizationURL);
  } catch (e) {
    console.error(e);
  }
});

// 4. Twitch will respond back to you to your redirectURI with some query parameters
app.get("/authorize", async (req, res) => {
  try {
    console.log("Response from Twitch:");
    console.log(req.query);

    if (req.query.error) return res.send(error);

    res.send(success);

    // Had to include this annoying check so my linter would stop yelling at me
    if (typeof req.query.code != "string") return;

    // 5. Take those query parameters and send a POST to Twitch to get a token
    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", config.twitch.clientId);
    urlencoded.append("client_secret", config.twitch.clientSecret);
    urlencoded.append("code", req.query.code);
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("redirect_uri", config.twitch.redirectURI);

    const fetchRes = await fetch(`https://id.twitch.tv/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlencoded,
      redirect: "follow",
    });

    // 6. Twitch responds with the token
    console.log("Response from Twitch OK:");
    const tokenData = await fetchRes.json();
    console.log(tokenData);

    // Write the tokens to token.json
    writeFileSync(
      "./tokens.json",
      JSON.stringify(
        {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: 0, // To know why this is set to 0, see https://twurple.js.org/docs/auth/providers/refreshing.html
          obtainmentTimestamp: 0, // To know why this is set to 0, see https://twurple.js.org/docs/auth/providers/refreshing.html
        },
        null,
        4
      ),
      "utf-8"
    );
  } catch (e) {
    console.error(e);
  }
});

app.listen(config.express.port, () =>
  console.log(`Express server listening on http://localhost:${config.express.port}`)
);
