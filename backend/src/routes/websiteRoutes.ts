import { Router } from 'express';
import { readCollection, insert } from '../storage/jsonStorage';
import crypto from 'crypto';

const router = Router();

const VALID_WEBSITE_TYPES = ['E_COMMERCE', 'EDUCATION', 'COLLEGE', 'HEALTHCARE', 'BANKING', 'BOOKING', 'SAAS', 'GOVERNMENT', 'CUSTOM'];
const VALID_GOALS = ['PURCHASE', 'REGISTRATION', 'FORM_SUBMISSION', 'APPOINTMENT', 'APPLICATION', 'DOWNLOAD', 'BOOKING', 'SIGNUP', 'ACTIVATION', 'CUSTOM_GOAL'];

router.get('/', async (req, res) => {
  try {
    const websites = await readCollection<any>('websites');
    // sort by created_at DESC roughly (if no created_at, just reverse array)
    websites.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });
    res.json({ success: true, websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params;
    const websites = await readCollection<any>('websites');
    const website = websites.find(w => w.website_id === websiteId);
    
    if (!website) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }
    res.json({ success: true, website });
  } catch (error) {
    console.error('Error fetching website:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { website_name, website_type, primary_goal } = req.body;

    if (!website_name || typeof website_name !== 'string' || website_name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Website name is required' });
    }
    if (!VALID_WEBSITE_TYPES.includes(website_type)) {
      return res.status(400).json({ success: false, error: 'Invalid website type' });
    }
    if (!VALID_GOALS.includes(primary_goal)) {
      return res.status(400).json({ success: false, error: 'Invalid primary goal' });
    }

    const uniqueHex = crypto.randomUUID().split('-')[0];
    const timestampHex = Date.now().toString(36);
    const website_id = `site_${timestampHex}_${uniqueHex}`;

    const newWebsite = {
      website_id,
      website_name: website_name.trim(),
      website_type,
      primary_goal,
      created_at: new Date().toISOString()
    };

    await insert('websites', newWebsite);

    res.json({ success: true, website: newWebsite });
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
