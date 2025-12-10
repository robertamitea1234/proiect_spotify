// --- Profile ---
async function fetchProfile(accessToken){
const r = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: 'Bearer ' + accessToken }});
return r.json();
}


async function showProfile(){
const hash = Object.fromEntries(location.hash.slice(1).split('&').map(p => p.split('=')));
const token = hash.access_token;
if(!token) return;
const profile = await fetchProfile(token);
document.getElementById('username') && (document.getElementById('username').innerText = profile.display_name || profile.id);
document.getElementById('email') && (document.getElementById('email').innerText = profile.email || 'hidden');
if(profile.images && profile.images.length && document.getElementById('avatar')) document.getElementById('avatar').src = profile.images[0].url;
// Top items
showTopItems(token);
}


// --- Top Artists / Albums ---
async function getTopArtists(token){
const r = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5', { headers:{ Authorization:'Bearer '+token }});
return r.json();
}


async function getTopAlbums(token){
const r = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', { headers:{ Authorization:'Bearer '+token }});
const data = await r.json();
const albumCount = {};
data.items.forEach(t => {
const alb = t.album.id;
albumCount[alb] = albumCount[alb] || { album: t.album, count: 0 };
albumCount[alb].count++;
});
return Object.values(albumCount).sort((a,b)=>b.count - a.count).slice(0,5).map(x=>x.album);
}


async function showTopItems(token){
const artists = await getTopArtists(token);
const albums = await getTopAlbums(token);


const artistDiv = document.getElementById('top-artists');
if(artistDiv) artists.items.forEach(a => {
const card = document.createElement('div'); card.className='card';
card.innerHTML=`<img src='${a.images[0]?.url || ''}'><p>${a.name}</p>`;
artistDiv.appendChild(card);
});


const albumDiv = document.getElementById('top-albums');
if(albumDiv) albums.forEach(a => {
const card = document.createElement('div'); card.className='card';
card.innerHTML=`<img src='${a.images[0]?.url || ''}'><p>${a.name}</p>`;
albumDiv.appendChild(card);
});
}


// --- Search ---
async function search(q, token){
const params = new URLSearchParams({ q, type:'track,artist,album', limit:'10' });
const r = await fetch('https://api.spotify.com/v1/search?' + params.toString(), { headers:{ Authorization: 'Bearer '+token }});
const data = await r.json();
renderResults(data);
}


function renderResults(data){
const div = document.getElementById('results');
if(!div) return;
div.innerHTML = '';
['tracks','artists','albums'].forEach(type => {
if(data[type]){
data[type].items.slice(0,5).forEach(item => {
const card = document.createElement('div'); card.className='card';
card.innerHTML=`<p>${item.name}</p>` + (item.images?.[0]?.url ? `<img src='${item.images[0].url}'>`:'');
div.appendChild(card);
});
}
});
}


// Search input event
const searchInput = document.getElementById('search-input');
if(searchInput){
const hash = Object.fromEntries(location.hash.slice(1).split('&').map(p => p.split('=')));
const token = hash.access_token;
searchInput.addEventListener('input', e => {
if(e.target.value.length>1 && token) search(e.target.value, token);
});
}


window.addEventListener('DOMContentLoaded', showProfile);