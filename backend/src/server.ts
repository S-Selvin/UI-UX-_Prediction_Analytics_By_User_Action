import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes';
import eventRoutes from './routes/eventRoutes';
import sessionRoutes from './routes/sessionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import websiteRoutes from './routes/websiteRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ type: ['application/json', 'text/plain'] }));

import { initializeStorage, readCollection, upsert } from './storage/jsonStorage';

// API Routes
app.use('/api', healthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/websites', websiteRoutes);

initializeStorage().then(() => {
  app.listen(PORT, () => {
    console.log(`ShopSense Backend running on port ${PORT}`);

    // Heartbeat Sweeper: Run every 10 seconds
    setInterval(async () => {
      try {
        const sessions = await readCollection<any>('sessions');
        const now = new Date().getTime();
        
        for (const session of sessions) {
          if (session.session_status === 'ACTIVE') {
            const lastActivity = new Date(session.last_activity || session.start_time).getTime();
            // Stale threshold: 15 seconds
            if (now - lastActivity > 15000) {
              await upsert(
                'sessions',
                session, 
                s => s.session_id === session.session_id,
                existing => {
                  // Double check it's still active
                  if (existing.session_status === 'ACTIVE') {
                    return {
                      ...existing,
                      session_status: 'ENDED',
                      end_time: existing.last_activity,
                      updated_at: new Date().toISOString()
                    };
                  }
                  return existing;
                }
              );
              console.log(`[Sweeper] Marked stale session ${session.session_id} as ENDED.`);
            }
          }
        }
      } catch (err) {
        console.error('[Sweeper] Error processing stale sessions:', err);
      }
    }, 10000);

  });
}).catch(err => {
  console.error('Failed to initialize JSON storage:', err);
  process.exit(1);
});
