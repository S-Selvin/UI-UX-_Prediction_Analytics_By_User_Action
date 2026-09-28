import { Router } from 'express';
import { readCollection } from '../storage/jsonStorage';

const router = Router();

// Define allowed status values based on the existing schemas
const VALID_SESSION_STATUSES = ['ACTIVE', 'ENDED', 'ABANDONED'];
const VALID_GOAL_STATUSES = ['PENDING', 'COMPLETED'];

router.get('/', async (req, res) => {
  try {
    const { 
      website_id, 
      session_status, 
      goal_status, 
      limit = '50', 
      offset = '0' 
    } = req.query;

    // Validate Statuses
    if (session_status && typeof session_status === 'string' && !VALID_SESSION_STATUSES.includes(session_status)) {
      return res.status(400).json({ success: false, error: 'Invalid session_status parameter' });
    }
    if (goal_status && typeof goal_status === 'string' && !VALID_GOAL_STATUSES.includes(goal_status)) {
      return res.status(400).json({ success: false, error: 'Invalid goal_status parameter' });
    }

    // Pagination limits
    let parsedLimit = parseInt(limit as string, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 50;
    if (parsedLimit > 1000) parsedLimit = 1000;

    let parsedOffset = parseInt(offset as string, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;

    const allSessions = await readCollection<any>('sessions');

    // Apply filtering
    let filteredSessions = allSessions;
    if (website_id) {
      filteredSessions = filteredSessions.filter(s => s.website_id === website_id);
    }
    if (session_status) {
      filteredSessions = filteredSessions.filter(s => s.session_status === session_status);
    }
    if (goal_status) {
      filteredSessions = filteredSessions.filter(s => s.goal_status === goal_status);
    }

    // Apply sorting: ORDER BY start_time DESC
    filteredSessions.sort((a, b) => {
      const timeA = new Date(a.start_time || 0).getTime();
      const timeB = new Date(b.start_time || 0).getTime();
      return timeB - timeA;
    });

    // Apply pagination
    const paginatedSessions = filteredSessions.slice(parsedOffset, parsedOffset + parsedLimit);

    res.json({
      success: true,
      sessions: paginatedSessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const allSessions = await readCollection<any>('sessions');
    const session = allSessions.find(s => s.session_id === sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
