const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Platform configurations
const PLATFORMS = {
  github: {
    name: 'GitHub',
    url: 'https://github.com/{username}',
    checkUrl: (username) => `https://github.com/${username}`
  },
  reddit: {
    name: 'Reddit',
    url: 'https://www.reddit.com/user/{username}',
    checkUrl: (username) => `https://www.reddit.com/user/${username}`
  },
  telegram: {
    name: 'Telegram',
    url: 'https://t.me/{username}',
    checkUrl: (username) => `https://t.me/${username}`
  },
  tiktok: {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@{username}',
    checkUrl: (username) => `https://www.tiktok.com/@${username}`
  },
  pinterest: {
    name: 'Pinterest',
    url: 'https://www.pinterest.com/{username}',
    checkUrl: (username) => `https://www.pinterest.com/${username}`
  },
  x: {
    name: 'X (Twitter)',
    url: 'https://x.com/{username}',
    checkUrl: (username) => `https://x.com/${username}`
  },
  instagram: {
    name: 'Instagram',
    url: 'https://www.instagram.com/{username}',
    checkUrl: (username) => `https://www.instagram.com/${username}`
  }
};

// Headers to avoid blocking
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};

// Check single platform with retry logic
async function checkPlatform(username, platformKey, retryCount = 0) {
  const platform = PLATFORMS[platformKey];
  const url = platform.checkUrl(username);
  
  try {
    const response = await axios.get(url, {
      headers,
      timeout: 1000,
      maxRedirects: 5,
      validateStatus: (status) => true // Accept all status codes
    });

    if (response.status === 200) {
      return { platform: platform.name, status: 'taken' };
    } else if (response.status === 404) {
      return { platform: platform.name, status: 'available' };
    } else {
      return { platform: platform.name, status: 'maybe' };
    }
  } catch (error) {
    if (retryCount < 1) {
      // Retry once
      await new Promise(resolve => setTimeout(resolve, 500));
      return checkPlatform(username, platformKey, retryCount + 1);
    }
    
    // If still failing after retry
    return { platform: platform.name, status: 'error' };
  }
}

// Check multiple platforms with concurrency limit
async function checkPlatformsWithLimit(username, platforms, limit = 5) {
  const results = [];
  const chunks = [];
  
  // Split into chunks for concurrency control
  for (let i = 0; i < platforms.length; i += limit) {
    chunks.push(platforms.slice(i, i + limit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(platform => checkPlatform(username, platform));
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  return results;
}

// API endpoint
app.get('/api/check', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { username, platforms } = req.query;
    
    // Validation
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!platforms) {
      return res.status(400).json({ error: 'Platforms are required' });
    }

    // Parse and validate platforms
    const platformList = platforms.split(',').map(p => p.trim().toLowerCase());
    
    // Filter valid platforms
    const validPlatforms = platformList.filter(p => PLATFORMS[p]);
    
    if (validPlatforms.length === 0) {
      return res.status(400).json({ error: 'No valid platforms selected' });
    }

    // Limit to max 5 platforms
    const limitedPlatforms = validPlatforms.slice(0, 5);

    // Check availability
    const results = await checkPlatformsWithLimit(username, limitedPlatforms, 5);
    
    const response = {
      username,
      results,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };

    res.json(response);
    
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Username Checker API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API endpoint: http://localhost:${PORT}/api/check`);
});
