import { Router } from 'express';
import { readCollection, insert, upsert } from '../storage/jsonStorage';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { website_id } = req.query;
    let events = await readCollection<any>('events');
    
    if (website_id) {
      events = events.filter(e => e.website_id === website_id);
    }
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      event_id,
      user_id,
      session_id,
      timestamp,
      event_type,
      website_id = 'demo-site',
      page = '',
      element = null,
      metadata = null
    } = req.body;

    // Validate required fields
    if (!event_id || !user_id || !session_id || !timestamp || !event_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // 1. Check for duplicate event
    const events = await readCollection<any>('events');
    if (events.some(e => e.event_id === event_id)) {
      return res.json({
        success: true,
        event_id,
        duplicate: true
      });
    }

    // 2. Ensure parent records exist (Websites, Users) safely
    await upsert(
      'websites',
      { website_id, website_name: 'Demo Site', website_type: 'E-commerce', primary_goal: 'Purchase' },
      w => w.website_id === website_id,
      existing => existing // Do nothing if it exists
    );

    await upsert(
      'users',
      { user_id, website_id, last_seen_at: timestamp },
      u => u.user_id === user_id,
      existing => ({ ...existing, last_seen_at: timestamp }) // Update last_seen_at
    );

    // 3. Update or Insert Session
    const validPage = page && page.trim().length > 0;
    const isOrderCompleted = event_type === 'order_completed';
    const isSessionEnd = event_type === 'session_end';
    const isHeartbeat = event_type === 'heartbeat';

    // Safely ignore heartbeats for unknown sessions without creating them
    if (isHeartbeat) {
      const allSessions = await readCollection<any>('sessions');
      if (!allSessions.some(s => s.session_id === session_id)) {
        return res.json({ success: true, event_id, ignored: true, reason: 'unknown_session_heartbeat' });
      }
    }

    await upsert(
      'sessions',
      {
        session_id, user_id, website_id, start_time: timestamp, 
        last_activity: timestamp, current_page: page, 
        session_status: isSessionEnd ? 'ENDED' : 'ACTIVE', 
        goal_status: isOrderCompleted ? 'COMPLETED' : 'PENDING',
        end_time: isSessionEnd ? timestamp : null
      },
      s => s.session_id === session_id,
      existing => {
        // If it's a duplicate session_end, do not modify the original end_time
        if (existing.session_status === 'ENDED' && isSessionEnd) {
          return existing;
        }

        // Do not allow heartbeat to revive an ENDED or ABANDONED session
        if (isHeartbeat && (existing.session_status === 'ENDED' || existing.session_status === 'ABANDONED')) {
          return existing;
        }

        // If it's NOT a session_end (e.g. page_view on refresh), revive it to ACTIVE. Heartbeat retains current status.
        const newStatus = isSessionEnd ? 'ENDED' : (isHeartbeat ? existing.session_status : 'ACTIVE');
        const newEndTime = isSessionEnd ? (existing.end_time || timestamp) : existing.end_time;

        return {
          ...existing,
          last_activity: timestamp,
          updated_at: new Date().toISOString(),
          current_page: validPage ? page : existing.current_page,
          goal_status: isOrderCompleted ? 'COMPLETED' : existing.goal_status,
          session_status: newStatus,
          end_time: newEndTime
        };
      }
    );

    // 4. Insert the new event (skip for session_end and heartbeat so it doesn't break analytics)
    if (!isSessionEnd && !isHeartbeat) {
      await insert('events', {
        event_id, session_id, user_id, website_id, timestamp, event_type, page, element, metadata
      });
    }

    res.json({
      success: true,
      event_id,
      duplicate: false
    });

  } catch (error) {
    console.error('Error ingesting event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
