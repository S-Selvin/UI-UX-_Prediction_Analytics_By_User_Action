import type { TrackingEvent, UserJourneyStep, EventType } from './types';

// Events that represent meaningful journey steps
const JOURNEY_EVENTS: Set<EventType> = new Set([
  'page_view',
  'search',
  'add_to_cart',
  'remove_from_cart',
  'quantity_increase',
  'quantity_decrease',
  'buy_now',
  'checkout_started',
  'checkout_form_interaction',
  'payment_method_selected',
  'order_completed',
  'back_navigation'
]);

const getEventLabel = (event: TrackingEvent): string => {
  switch (event.event_type) {
    case 'page_view': return `Viewed ${event.page}`;
    case 'search': return `Search Performed`;
    case 'add_to_cart': return `Added Product to Cart`;
    case 'remove_from_cart': return `Removed Product from Cart`;
    case 'quantity_increase': return `Increased Cart Quantity`;
    case 'quantity_decrease': return `Decreased Cart Quantity`;
    case 'buy_now': return `Clicked Buy Now`;
    case 'checkout_started': return `Started Checkout`;
    case 'checkout_form_interaction': return `Interacted with Checkout Form`;
    case 'payment_method_selected': return `Selected Payment Method`;
    case 'order_completed': return `Completed Order`;
    case 'back_navigation': return `Went Back`;
    default: return event.event_type;
  }
};

export const buildUserJourney = (events: TrackingEvent[]): UserJourneyStep[] => {
  if (!events || events.length < 1) {
    return [];
  }

  const journey: UserJourneyStep[] = [];
  
  let backNavigations = 0;
  let cartChanges = 0;
  let formInteractions = 0;
  
  let currentIdleStart = 0;
  let totalIdleMs = 0;
  let inactivityWarningTriggered = false;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Track friction counts internally as we iterate chronologically
    if (event.event_type === 'back_navigation') backNavigations++;
    if (event.event_type === 'quantity_increase' || event.event_type === 'quantity_decrease') cartChanges++;
    if (event.event_type === 'checkout_form_interaction') formInteractions++;

    if (event.event_type === 'idle_start') {
      currentIdleStart = new Date(event.timestamp).getTime();
    } else if (event.event_type === 'idle_end' && currentIdleStart > 0) {
      totalIdleMs += (new Date(event.timestamp).getTime() - currentIdleStart);
      currentIdleStart = 0;
    }

    // Only include meaningful events in the visible journey
    if (JOURNEY_EVENTS.has(event.event_type)) {
      
      let frictionWarning: string | undefined;

      if (event.event_type === 'back_navigation' && backNavigations >= 2) {
        frictionWarning = '⚠️ Navigation friction: Multiple back navigations.';
      } else if ((event.event_type === 'quantity_increase' || event.event_type === 'quantity_decrease') && cartChanges >= 3) {
        frictionWarning = '⚠️ Cart friction: Repeated cart quantity changes.';
      } else if (event.event_type === 'checkout_form_interaction' && formInteractions >= 5) {
        frictionWarning = '⚠️ Form friction: High volume of form interactions.';
      }

      // If inactivity crossed threshold since last journey event, attach warning to this event
      if (!inactivityWarningTriggered && totalIdleMs >= 60000) {
        const inactivityMsg = '⚠️ Inactivity friction: Long idle period detected.';
        frictionWarning = frictionWarning ? `${frictionWarning} ${inactivityMsg}` : inactivityMsg;
        inactivityWarningTriggered = true; // only warn once per session in the timeline to avoid spam
      }

      // Avoid spamming form interaction steps: only include the first and then every 5th
      if (event.event_type === 'checkout_form_interaction') {
         if (formInteractions > 1 && formInteractions % 5 !== 0) {
            continue; // skip rendering to avoid timeline clutter
         }
      }

      journey.push({
        timestamp: event.timestamp,
        eventType: event.event_type,
        page: event.page,
        label: getEventLabel(event),
        frictionWarning
      });
    }
  }

  // If session ended on a long idle, and we never attached the warning, we could optionally append an idle step.
  // But standard journey just ends at last explicit interaction.

  return journey;
};
