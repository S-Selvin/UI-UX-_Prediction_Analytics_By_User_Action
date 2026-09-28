import { Router, Request } from 'express';
import { readCollection } from '../storage/jsonStorage';

const router = Router();

/**
 * Utility function to build a filter predicate based on query params.
 */
function buildFilters(req: Request, timeField: string) {
  const { website_id, from, to } = req.query;
  
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (from) {
    fromDate = new Date(from as string);
    if (isNaN(fromDate.getTime())) throw new Error('Invalid from date');
  }

  if (to) {
    toDate = new Date(to as string);
    if (isNaN(toDate.getTime())) throw new Error('Invalid to date');
    // Add one day to make the "to" date inclusive through 23:59:59
    toDate.setDate(toDate.getDate() + 1);
  }

  return (item: any) => {
    if (website_id && item.website_id !== website_id) return false;
    
    if (fromDate || toDate) {
      const itemTime = new Date(item[timeField]).getTime();
      if (fromDate && itemTime < fromDate.getTime()) return false;
      if (toDate && itemTime >= toDate.getTime()) return false;
    }
    
    return true;
  };
}

router.get('/overview', async (req, res) => {
  try {
    let sessionFilter;
    try {
      sessionFilter = buildFilters(req, 'start_time');
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }

    const allSessions = await readCollection<any>('sessions');
    const filteredSessions = allSessions.filter(sessionFilter);

    let active_sessions = 0;
    let ended_sessions = 0;
    let abandoned_sessions = 0;
    let completed_sessions = 0;

    for (const session of filteredSessions) {
      if (session.session_status === 'ACTIVE') active_sessions++;
      if (session.session_status === 'ENDED') ended_sessions++;
      if (session.session_status === 'ABANDONED') abandoned_sessions++;
      if (session.goal_status === 'COMPLETED') completed_sessions++;
    }

    const total_sessions = filteredSessions.length;

    let eventFilter;
    try {
      eventFilter = buildFilters(req, 'timestamp');
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }

    const allEvents = await readCollection<any>('events');
    const total_events = allEvents.filter(eventFilter).length;

    let stored_session_goal_completion_rate = null;
    if (total_sessions > 0) {
      stored_session_goal_completion_rate = parseFloat(((completed_sessions / total_sessions) * 100).toFixed(2));
    }

    res.json({
      success: true,
      total_sessions,
      active_sessions,
      ended_sessions,
      abandoned_sessions,
      completed_sessions,
      total_events,
      stored_session_goal_completion_rate
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/session-trends', async (req, res) => {
  try {
    let sessionFilter;
    try {
      sessionFilter = buildFilters(req, 'start_time');
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }

    const allSessions = await readCollection<any>('sessions');
    const filteredSessions = allSessions.filter(sessionFilter);

    const trendsMap = new Map<string, number>();

    for (const session of filteredSessions) {
      if (!session.start_time) continue;
      const date = session.start_time.split('T')[0];
      trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
    }

    const trends = Array.from(trendsMap.entries())
      .map(([date, sessions]) => ({ date, sessions }))
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json({ success: true, trends });
  } catch (error) {
    console.error('Error fetching session trends:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/goal-trends', async (req, res) => {
  try {
    let sessionFilter;
    try {
      sessionFilter = buildFilters(req, 'start_time');
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }

    const allSessions = await readCollection<any>('sessions');
    const filteredSessions = allSessions.filter(sessionFilter);

    const trendsMap = new Map<string, { completed: number, total: number }>();

    for (const session of filteredSessions) {
      if (!session.start_time) continue;
      const date = session.start_time.split('T')[0];
      const entry = trendsMap.get(date) || { completed: 0, total: 0 };
      
      entry.total++;
      if (session.goal_status === 'COMPLETED') {
        entry.completed++;
      }
      
      trendsMap.set(date, entry);
    }

    const trends = Array.from(trendsMap.entries())
      .map(([date, data]) => ({ date, completed: data.completed, total: data.total }))
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json({ success: true, trends });
  } catch (error) {
    console.error('Error fetching goal trends:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/events', async (req, res) => {
  try {
    let eventFilter;
    try {
      eventFilter = buildFilters(req, 'timestamp');
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }

    const allEvents = await readCollection<any>('events');
    const filteredEvents = allEvents.filter(eventFilter);

    const eventCountMap = new Map<string, number>();

    for (const event of filteredEvents) {
      if (!event.event_type) continue;
      eventCountMap.set(event.event_type, (eventCountMap.get(event.event_type) || 0) + 1);
    }

    const events = Array.from(eventCountMap.entries())
      .map(([event_type, count]) => ({ event_type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/pages', async (req, res) => {
  try {
    let eventFilter;
    try {
      eventFilter = buildFilters(req, 'timestamp');
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }

    const allEvents = await readCollection<any>('events');
    const filteredEvents = allEvents.filter(eventFilter);

    const pageCountMap = new Map<string, number>();

    for (const event of filteredEvents) {
      if (!event.page || event.page.trim() === '') continue;
      pageCountMap.set(event.page, (pageCountMap.get(event.page) || 0) + 1);
    }

    const pages = Array.from(pageCountMap.entries())
      .map(([page, event_count]) => ({ page, event_count }))
      .sort((a, b) => b.event_count - a.event_count)
      .slice(0, 100);

    res.json({ success: true, pages });
  } catch (error) {
    console.error('Error fetching page activity:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/ux-health', async (req, res) => {
  try {
    let eventFilter;
    try {
      eventFilter = buildFilters(req, 'timestamp');
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }

    const allEvents = await readCollection<any>('events');
    const filteredEvents = allEvents.filter(eventFilter);

    const sessionMetrics = new Map<string, { back_navigations: number, cart_changes: number, form_interactions: number }>();

    for (const event of filteredEvents) {
      if (!event.session_id) continue;
      
      const metrics = sessionMetrics.get(event.session_id) || { back_navigations: 0, cart_changes: 0, form_interactions: 0 };
      
      if (event.event_type === 'back_navigation') metrics.back_navigations++;
      if (event.event_type === 'quantity_increase' || event.event_type === 'quantity_decrease') metrics.cart_changes++;
      if (event.event_type === 'checkout_form_interaction') metrics.form_interactions++;
      
      sessionMetrics.set(event.session_id, metrics);
    }

    let totalFriction = 0;
    let sessionCount = 0;

    for (const metrics of sessionMetrics.values()) {
      const friction = Math.min(metrics.back_navigations * 10, 30) + 
                       Math.min(metrics.cart_changes * 5, 25) + 
                       Math.min(Math.max(metrics.form_interactions - 4, 0) * 5, 25);
      totalFriction += friction;
      sessionCount++;
    }

    const avgFrictionScore = sessionCount > 0 ? Math.max(0, Math.min(Math.round(totalFriction / sessionCount), 100)) : 0;

    let frictionLevel = 'LOW';
    if (avgFrictionScore > 70) frictionLevel = 'HIGH';
    else if (avgFrictionScore > 30) frictionLevel = 'MEDIUM';

    res.json({
      success: true,
      score: null,
      level: 'INSUFFICIENT_DATA',
      frictionScore: avgFrictionScore,
      frictionLevel,
      reasons: ['Backend behavior syncing is required for full UX Health calculation.'],
      evidence: [],
      signals: {
        engagement: null,
        activity: null,
        hesitation: null,
        navigationConfusion: null,
        friction: avgFrictionScore,
        goalCompletion: null
      }
    });

  } catch (error) {
    console.error('Error fetching ux-health:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
