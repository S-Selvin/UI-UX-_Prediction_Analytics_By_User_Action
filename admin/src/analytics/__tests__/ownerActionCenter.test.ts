import { transformProblemsToActions } from '../ownerActionCenter';
import type { UXProblem } from '../types';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    // @ts-ignore
    process.exit(1);
  }
};

console.log('Running Owner Action Center Deterministic Tests...');

// Mock Problem Generator
const createProblem = (id: string, priority: 'HIGH'|'MEDIUM'|'LOW', affectedSessions: number, category: any = 'GENERAL'): UXProblem => ({
  id,
  category,
  priority,
  title: `Title for ${id}`,
  affectedSessions,
  affectedSessionIds: Array(affectedSessions).fill('s1'),
  percentageOfSessions: 50,
  evidence: ['Some evidence'],
  reasons: ['Some reason'],
  impact: 'Observed impact'
});

// CASE 1: Empty input -> Empty output
assert(transformProblemsToActions([]).length === 0, 'Empty input should return empty array');

// CASE 2: One navigation problem
let problems = [createProblem('improve-navigation-clarity', 'HIGH', 1, 'NAVIGATION')];
let actions = transformProblemsToActions(problems);
assert(actions.length === 1, 'Should map navigation problem');
assert(actions[0].id === 'improve-navigation-clarity', 'Should preserve ID');
assert(actions[0].priority === 'HIGH', 'Should preserve priority');
assert(actions[0].affectedSessions === 1, 'Should preserve session count');

// CASE 3: Checkout problem
problems = [createProblem('improve-checkout-completion', 'HIGH', 5, 'CHECKOUT')];
actions = transformProblemsToActions(problems);
assert(actions[0].category === 'CHECKOUT', 'Should map checkout category');

// CASE 4: Healthy problem excluded
problems = [createProblem('healthy-experience', 'LOW', 10, 'GENERAL')];
actions = transformProblemsToActions(problems);
assert(actions.length === 0, 'Healthy experience must be excluded from Owner Action Center');

// CASE 5: Unknown problem ID ignored safely
problems = [createProblem('unknown-random-id', 'HIGH', 1)];
actions = transformProblemsToActions(problems);
assert(actions.length === 0, 'Unknown IDs should be safely skipped');

// CASE 6: Sorting (HIGH -> MEDIUM -> LOW, then affected descending)
problems = [
  createProblem('improve-product-cart-conversion', 'MEDIUM', 5),
  createProblem('reduce-user-hesitation', 'HIGH', 2),
  createProblem('re-engage-inactive-users', 'MEDIUM', 10),
  createProblem('encourage-user-interaction', 'LOW', 20)
];
actions = transformProblemsToActions(problems);
assert(actions[0].id === 'reduce-user-hesitation', 'HIGH priority should be first');
assert(actions[1].id === 're-engage-inactive-users', 'MEDIUM with 10 sessions should be second');
assert(actions[2].id === 'improve-product-cart-conversion', 'MEDIUM with 5 sessions should be third');
assert(actions[3].id === 'encourage-user-interaction', 'LOW priority should be last');

// CASE 7: Deterministic Output content (No financial impact claims)
problems = [createProblem('reduce-payment-drop-off', 'HIGH', 3)];
actions = transformProblemsToActions(problems);
assert(actions[0].whyItMatters === 'Users reach the payment selection step but abandon before finalizing the order.', 'Should use deterministic explanatory guidance');
assert(actions[0].actionSteps.length > 0, 'Should provide action steps');
assert(!actions[0].whyItMatters.includes('revenue') && !actions[0].recommendedAction.includes('revenue'), 'Should not contain financial predictions');

console.log('✅ All Phase 15 Owner Action Center tests passed!');
