// ============================================================
// Verification: date helpers handle Malaysia early-morning correctly
// Simulates "1am Malaysia time" and shows NEW vs OLD behavior
// ============================================================

// ----- NEW (fixed) functions, copied from salesman_order.html -----
function todayMY_NEW(nowMs) {
  return new Date(nowMs + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
function addDaysMY(ymd, days) {
  const d = new Date(ymd + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ----- OLD (buggy) versions for comparison -----
function todayMY_OLD_bossfile(nowMs) {
  // Buggy version that was in boss_leaderboard.html + collections.html
  // (uses getTimezoneOffset — only works in UTC browser)
  const now = new Date(nowMs);
  // Simulate browser-in-Malaysia: getTimezoneOffset() returns -480
  const SIM_BROWSER_TZ_OFFSET = -480;
  const malaysia = new Date(now.getTime() + (8 * 60 + SIM_BROWSER_TZ_OFFSET) * 60000);
  return malaysia.toISOString().slice(0, 10);
}
function today_OLD_salesmanfile(nowMs) {
  // What salesman_order.html USED to do — raw UTC
  return new Date(nowMs).toISOString().slice(0, 10);
}
function dueDate_OLD(nowMs, creditDays) {
  // Old buggy due_date computation
  return new Date(nowMs + creditDays * 86400000).toISOString().slice(0, 10);
}

// ============================================================
// TEST SCENARIOS
// ============================================================
console.log('='.repeat(70));
console.log('DATE FIX VERIFICATION — simulating Malaysia browser (UTC+8)');
console.log('='.repeat(70));

const scenarios = [
  {
    label: 'Normal daytime: 10:00 AM Malaysia',
    utcMs: Date.UTC(2026, 4, 8, 2, 0, 0), // 2026-05-08 02:00 UTC = 10:00 MY
    expectedMY: '2026-05-08',
  },
  {
    label: 'BUG SCENARIO: 1:00 AM Malaysia (= 5pm UTC previous day)',
    utcMs: Date.UTC(2026, 4, 7, 17, 0, 0), // 2026-05-07 17:00 UTC = 2026-05-08 01:00 MY
    expectedMY: '2026-05-08',
  },
  {
    label: 'Edge: 11:59 PM Malaysia (= 15:59 UTC same day)',
    utcMs: Date.UTC(2026, 4, 8, 15, 59, 0),
    expectedMY: '2026-05-08',
  },
  {
    label: 'Edge: 12:00 AM (midnight) Malaysia',
    utcMs: Date.UTC(2026, 4, 7, 16, 0, 0), // 16:00 UTC = midnight MY
    expectedMY: '2026-05-08',
  },
];

for (const s of scenarios) {
  console.log('\n' + '-'.repeat(70));
  console.log('Scenario:', s.label);
  console.log('UTC time:', new Date(s.utcMs).toISOString());
  console.log('Expected MY date:', s.expectedMY);
  console.log('');
  const newResult = todayMY_NEW(s.utcMs);
  const oldBossResult = todayMY_OLD_bossfile(s.utcMs);
  const oldSalesmanResult = today_OLD_salesmanfile(s.utcMs);

  const newOk = newResult === s.expectedMY;
  const oldBossOk = oldBossResult === s.expectedMY;
  const oldSalesmanOk = oldSalesmanResult === s.expectedMY;

  console.log(`  NEW todayMY():                  ${newResult}  ${newOk ? 'PASS' : 'FAIL'}`);
  console.log(`  OLD (boss_leaderboard buggy):   ${oldBossResult}  ${oldBossOk ? 'PASS' : 'FAIL'}`);
  console.log(`  OLD (salesman_order raw UTC):   ${oldSalesmanResult}  ${oldSalesmanOk ? 'PASS' : 'FAIL'}`);
}

console.log('\n' + '='.repeat(70));
console.log('DUE_DATE CALCULATION — 30 day credit term');
console.log('='.repeat(70));

const submitTime = Date.UTC(2026, 4, 7, 17, 0, 0); // 1am MY on 2026-05-08
console.log('Submitting at: 1:00 AM Malaysia time on 2026-05-08');
console.log('Credit term: 30 days');
console.log('Expected due_date: 2026-06-07 (May 8 + 30 days)');
console.log('');

const orderDateNew = todayMY_NEW(submitTime);
const dueDateNew = addDaysMY(orderDateNew, 30);
const dueDateOld = dueDate_OLD(submitTime, 30);

console.log(`  NEW order_date:  ${orderDateNew}`);
console.log(`  NEW due_date:    ${dueDateNew}  ${dueDateNew === '2026-06-07' ? 'PASS' : 'FAIL'}`);
console.log(`  OLD due_date:    ${dueDateOld}  ${dueDateOld === '2026-06-07' ? 'PASS' : 'FAIL'}  (uses Date.now() raw UTC)`);
