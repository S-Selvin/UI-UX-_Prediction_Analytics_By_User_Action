import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const DATA_DIR = path.join(__dirname, '../../data');

router.get('/health', async (req, res) => {
  try {
    // Check if the data directory is accessible
    await fs.access(DATA_DIR);
    
    res.json({
      status: 'ok',
      service: 'ShopSense backend',
      storage: 'json'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'ShopSense backend',
      storage: 'disconnected'
    });
  }
});

export default router;
