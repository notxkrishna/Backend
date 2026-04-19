const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Username Checker API is running!',
    endpoints: { health: '/health', check: '/api/check?username=xxx&platforms=github,reddit' },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ========== सभी 15 PLATFORMS ==========
const PLATFORMS = {
  instagram: { name: 'Instagram', url: (u) => `https://www.instagram.com/${u}`, check: async (username) => { try { const res = await axios.get(`https://www.instagram.com/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  youtube: { name: 'YouTube', url: (u) => `https://www.youtube.com/@${u}`, check: async (username) => { try { const res = await axios.get(`https://www.youtube.com/@${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  facebook: { name: 'Facebook', url: (u) => `https://www.facebook.com/${u}`, check: async (username) => { try { const res = await axios.get(`https://www.facebook.com/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  x: { name: 'X (Twitter)', url: (u) => `https://x.com/${u}`, check: async (username) => { try { const res = await axios.get(`https://x.com/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  tiktok: { name: 'TikTok', url: (u) => `https://www.tiktok.com/@${u}`, check: async (username) => { try { const res = await axios.get(`https://www.tiktok.com/@${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  snapchat: { name: 'Snapchat', url: (u) => `https://www.snapchat.com/add/${u}`, check: async (username) => { try { const res = await axios.get(`https://www.snapchat.com/add/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  pinterest: { name: 'Pinterest', url: (u) => `https://www.pinterest.com/${u}`, check: async (username) => { try { const res = await axios.get(`https://www.pinterest.com/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  reddit: { name: 'Reddit', url: (u) => `https://www.reddit.com/user/${u}`, check: async (username) => { try { const res = await axios.get(`https://www.reddit.com/user/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  twitch: { name: 'Twitch', url: (u) => `https://www.twitch.tv/${u}`, check: async (username) => { try { const res = await axios.get(`https://www.twitch.tv/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  github: { name: 'GitHub', url: (u) => `https://github.com/${u}`, check: async (username) => { try { const res = await axios.get(`https://github.com/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  linkedin: { name: 'LinkedIn', url: (u) => `https://www.linkedin.com/in/${u}`, check: async (username) => { try { const res = await axios.get(`https://www.linkedin.com/in/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  discord: { name: 'Discord', url: (u) => `https://discord.com/users/${u}`, check: async (username) => { try { const res = await axios.get(`https://discord.com/users/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  medium: { name: 'Medium', url: (u) => `https://medium.com/@${u}`, check: async (username) => { try { const res = await axios.get(`https://medium.com/@${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  telegram: { name: 'Telegram', url: (u) => `https://t.me/${u}`, check: async (username) => { try { const res = await axios.get(`https://t.me/${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } },
  threads: { name: 'Threads', url: (u) => `https://www.threads.net/@${u}`, check: async (username) => { try { const res = await axios.get(`https://www.threads.net/@${username}`, { timeout: 5000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } }); return res.status === 200 ? 'taken' : 'available'; } catch { return 'maybe'; } } }
};

app.get('/api/check', async (req, res) => {
  const start = Date.now();
  try {
    const { username, platforms } = req.query;
    if (!username) return res.status(400).json({ error: 'Username required' });
    if (!platforms) return res.status(400).json({ error: 'Platforms required' });
    
    const platformList = platforms.split(',').map(p => p.trim().toLowerCase());
    const validPlatforms = platformList.filter(p => PLATFORMS[p]);
    
    if (validPlatforms.length === 0) return res.status(400).json({ error: 'No valid platforms' });
    
    const results = await Promise.all(validPlatforms.map(async (platformId) => {
      const platform = PLATFORMS[platformId];
      const status = await platform.check(username);
      return { platform: platform.name, status, url: platform.url(username) };
    }));
    
    res.json({ username, results, responseTime: Date.now() - start, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
