import { TwitterApi } from 'twitter-api-v2';
import express from 'express';
const app = express()

async function getTokens() {
    const clientId = process.argv[2];
    const secretId = process.argv[3];
    const callback = process.argv[4];
    const client = new TwitterApi({ clientId, clientSecret: secretId });
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(callback, {
        scope:
            [
                'tweet.read',
                'users.read',
                'tweet.write',
                'tweet.moderate.write',
                'follows.read',
                'follows.write',
                'offline.access',
                'space.read',
                'mute.read',
                'mute.write',
                'like.read',
                'like.write',
                'list.read',
                'list.write',
                'block.read',
                'block.write',
            ]
    });

    console.log('Visit this URL', url);

    app.get('/callback', (req, res) => {
        // Exact state and code from query string
        const { state, code } = req.query;

        if (!codeVerifier || !state || !code) {
            return res.status(400).send('You denied the app or your session expired!');
        }
        console.log(req.query);
        console.log(codeVerifier);
        client.loginWithOAuth2({ code, codeVerifier, redirectUri: callback })
            .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
                // {loggedClient} is an authenticated client in behalf of some user
                // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
                // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

                const { data: userObject } = await loggedClient.v2.me();
                // Example request
                console.log({accessToken});
                console.log({refreshToken});
                res.send(`Access: ${accessToken}, refresh:${refreshToken}`);
            })
            .catch((e) => res.status(403).send(e));
    });
    app.listen(3000, () => {
        console.log(`Example app listening on port ${3000}`)
      })
}
getTokens();