require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const querystring = require('querystring');
const app = express();
app.use(express.static('public'));
app.use(express.json());


const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;


app.get('/login', (req, res) => {
const scope = 'user-read-private user-read-email user-top-read';
const params = querystring.stringify({
response_type: 'code',
client_id,
scope,
redirect_uri
});
res.redirect('https://accounts.spotify.com/authorize?' + params);
});


app.get('/callback', async (req, res) => {
const code = req.query.code || null;
const body = querystring.stringify({
grant_type: 'authorization_code',
code,
redirect_uri,
client_id,
client_secret
});
try {
const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
method: 'POST',
headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
body
});
const tokens = await tokenRes.json();
res.redirect(`/profile.html#access_token=${tokens.access_token}`);
} catch (err) {
res.status(500).json({error: 'token exchange failed', detail: err.message});
}
});


app.post('/refresh_token', async (req,res) => {
const { refresh_token } = req.body;
const body = querystring.stringify({ grant_type: 'refresh_token', refresh_token, client_id, client_secret });
const tokenRes = await fetch('https://accounts.spotify.com/api/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body });
const tokens = await tokenRes.json();
res.json(tokens);
});


app.listen(3000, ()=> console.log('Server running on http://localhost:3000'));