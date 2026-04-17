const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Root route - Quick health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Username Checker API is running!',
    endpoints: {
      health: '/health',
      check: '/api/check?username=xxx&platforms=github,reddit'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Platform configurations
const PLATFORMS = {
  github: {
    name: 'GitHub',
    url: (u) => `https://github.com/${u}`,
    check: async (username) => {
      try {
        const res = await axios.get(`https://github.com/${username}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.status === 200 ? 'taken' : 'available';
      } catch {
        return 'maybe';
      }
    }
  },
  reddit: {
    name: 'Reddit',
    url: (u) => `https://www.reddit.com/user/${u}`,
    check: async (username) => {
      try {
        const res = await axios.get(`https://www.reddit.com/user/${username}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.status === 200 ? 'taken' : 'available';
      } catch {
        return 'maybe';
      }
    }
  },
  telegram: {
    name: 'Telegram',
    url: (u) => `https://t.me/${u}`,
    check: async (username) => {
      try {
        const res = await axios.get(`https://t.me/${username}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.status === 200 ? 'taken' : 'available';
      } catch {
        return 'maybe';
      }
    }
  },
  tiktok: {
    name: 'TikTok',
    url: (u) => `https://www.tiktok.com/@${u}`,
    check: async (username) => {
      try {
        const res = await axios.get(`https://www.tiktok.com/@${username}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.status === 200 ? 'taken' : 'available';
      } catch {
        return 'maybe';
      }
    }
  },
  pinterest: {
    name: 'Pinterest',
    url: (u) => `https://www.pinterest.com/${u}`,
    check: async (username) => {
      try {
        const res = await axios.get(`https://www.pinterest.com/${username}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.status === 200 ? 'taken' : 'available';
      } catch {
        return 'maybe';
      }
    }
  },
  x: {
    name: 'X (Twitter)',
    url: (u) => `https://x.com/${u}`,
    check: async (username) => {
      try {
        const res = await axios.get(`https://x.com/${username}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.status === 200 ? 'taken' : 'available';
      } catch {
        return 'maybe';
      }
    }
  },
  instagram: {
    name: 'Instagram',
    url: (u) => `https://www.instagram.com/${u}`,
    check: async (username) => {
      try {
        const res = await axios.get(`https://www.instagram.com/${username}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.status === 200 ? 'taken' : 'available';
      } catch {
        return 'maybe';
      }
    }
  }
};

// Main check endpoint
app.get('/api/check', async (req, res) => {
  const start = Date.now();
  
  try {
    const { username, platforms } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    if (!platforms) {
      return res.status(400).json({ error: 'Platforms required' });
    }
    
    // Parse platforms
    const platformList = platforms.split(',').map(p => p.trim().toLowerCase());
    const validPlatforms = platformList.filter(p => PLATFORMS[p]).slice(0, 5);
    
    if (validPlatforms.length === 0) {
      return res.status(400).json({ error: 'No valid platforms' });
    }
    
    // Check all platforms in parallel
    const results = await Promise.all(
      validPlatforms.map(async (platformId) => {
        const platform = PLATFORMS[platformId];
        const status = await platform.check(username);
        return {
          platform: platform.name,
          status: status,
          url: platform.url(username)
        };
      })
    );
    
    res.json({
      username,
      results,
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API endpoint: http://localhost:${PORT}/api/check`);
});
