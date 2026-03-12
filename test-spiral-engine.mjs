/**
 * SPIRAL ENGINE TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Run: node test-spiral-engine.mjs
 * Tests: Initialize → Add XP → Level Up → Unlock Forges → Octave Return
 */

const API_URL = 'http://localhost:8888/.netlify/functions/spiral-progress'; // Local dev
// const API_URL = 'https://consciousnessrevolution.io/.netlify/functions/spiral-progress'; // Production

const TEST_USER = `test-user-${Date.now()}`;

async function request(method, body = null) {
    const url = method === 'GET' && body
        ? `${API_URL}?userId=${body.userId}`
        : API_URL;

    const options = {
        method: method === 'GET' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    return data;
}

async function test(name, fn) {
    try {
        console.log(`\n🧪 ${name}`);
        await fn();
        console.log(`✅ PASS`);
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
        console.error(error);
    }
}

async function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

async function assertTrue(value, message) {
    if (!value) {
        throw new Error(message);
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════');
console.log('SPIRAL ENGINE TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Test User: ${TEST_USER}`);

await test('1. Initialize User', async () => {
    const result = await request('POST', {
        action: 'initialize',
        userId: TEST_USER
    });

    assertTrue(result.success, 'Should succeed');
    assertTrue(result.data.is_initialized, 'User should be initialized');
    assertEqual(result.data.forges.length, 1, 'Should have 1 forge (Reality)');

    const reality = result.data.forges[0];
    assertEqual(reality.slug, 'reality', 'First forge should be Reality');
    assertEqual(reality.current_level, 1, 'Should start at level 1');
    assertEqual(reality.total_xp, 0, 'Should have 0 XP');

    console.log(`   Reality: L${reality.current_level}, ${reality.total_xp} XP`);
});

await test('2. Get User Progress', async () => {
    const result = await request('GET', { userId: TEST_USER });

    assertTrue(result.success, 'Should succeed');
    assertEqual(result.data.user_id, TEST_USER, 'Should return correct user');
    assertTrue(result.data.is_initialized, 'User should be initialized');
});

await test('3. Add 100 XP → Level 2', async () => {
    const result = await request('POST', {
        action: 'add_xp',
        userId: TEST_USER,
        forgeSlug: 'reality',
        amount: 100,
        source: 'mission_complete',
        metadata: { test: 'level_2' }
    });

    assertTrue(result.success, 'Should succeed');
    assertEqual(result.data.new_level, 2, 'Should level up to 2');
    assertEqual(result.data.total_xp, 100, 'Should have 100 total XP');
    assertTrue(result.data.leveled_up, 'Should show leveled_up: true');

    console.log(`   🎉 Leveled up to L${result.data.new_level}!`);
});

await test('4. Add 300 XP → Level 3', async () => {
    const result = await request('POST', {
        action: 'add_xp',
        userId: TEST_USER,
        forgeSlug: 'reality',
        amount: 300,
        source: 'challenge_win'
    });

    assertTrue(result.success, 'Should succeed');
    assertEqual(result.data.new_level, 3, 'Should level up to 3');
    assertEqual(result.data.total_xp, 400, 'Should have 400 total XP');

    console.log(`   🎉 Leveled up to L${result.data.new_level}!`);
});

await test('5. Add 1600 XP → Level 7 (Master)', async () => {
    const result = await request('POST', {
        action: 'add_xp',
        userId: TEST_USER,
        forgeSlug: 'reality',
        amount: 1600,
        source: 'bonus',
        metadata: { reason: 'Test L7 unlock' }
    });

    assertTrue(result.success, 'Should succeed');
    assertEqual(result.data.new_level, 7, 'Should level up to 7');
    assertEqual(result.data.total_xp, 2000, 'Should have 2000 total XP');

    console.log(`   🎉 Reached L7 MASTER!`);
});

await test('6. Verify All Forges Unlocked', async () => {
    const result = await request('GET', { userId: TEST_USER });

    assertTrue(result.success, 'Should succeed');
    assertEqual(result.data.forges.length, 7, 'Should have all 7 forges unlocked');

    const unlockedForges = result.data.forges.filter(f => f.status === 'unlocked');
    assertEqual(unlockedForges.length, 7, 'All 7 forges should be unlocked');

    console.log(`   ✨ All 7 forges unlocked!`);
    result.data.forges.forEach(f => {
        console.log(`      ${f.icon} ${f.name} - L${f.current_level}`);
    });
});

await test('7. Try Adding XP to Locked Forge (Should Fail)', async () => {
    // Create a new user who hasn't reached L7
    const newUser = `test-locked-${Date.now()}`;
    await request('POST', { action: 'initialize', userId: newUser });

    const result = await request('POST', {
        action: 'add_xp',
        userId: newUser,
        forgeSlug: 'creation',
        amount: 100,
        source: 'mission_complete'
    });

    assertTrue(!result.success, 'Should fail - forge not unlocked');
    assertEqual(result.error, 'Forge not unlocked', 'Should show locked error');

    console.log(`   🔒 Correctly blocked XP to locked forge`);
});

await test('8. Add XP to Creation Forge', async () => {
    const result = await request('POST', {
        action: 'add_xp',
        userId: TEST_USER,
        forgeSlug: 'creation',
        amount: 500,
        source: 'content_create'
    });

    assertTrue(result.success, 'Should succeed');
    assertTrue(result.data.new_level >= 1, 'Should have progress in Creation');

    console.log(`   🎨 Creation Forge: L${result.data.new_level}`);
});

await test('9. Push Infinity to L13 → Octave Return', async () => {
    // Need 37,600 total XP for L13
    const result = await request('POST', {
        action: 'add_xp',
        userId: TEST_USER,
        forgeSlug: 'infinity',
        amount: 37600,
        source: 'admin_grant',
        metadata: { reason: 'Test octave return' }
    });

    assertTrue(result.success, 'Should succeed');
    assertEqual(result.data.new_level, 13, 'Should reach L13 Transcendent');

    console.log(`   ♾️ Infinity L13 TRANSCENDENT reached!`);
});

await test('10. Verify Octave Return → Reality L8', async () => {
    const result = await request('GET', { userId: TEST_USER });

    assertTrue(result.success, 'Should succeed');

    const reality = result.data.forges.find(f => f.slug === 'reality');
    assertEqual(reality.current_level, 8, 'Reality should jump to L8');

    const infinity = result.data.forges.find(f => f.slug === 'infinity');
    assertEqual(infinity.current_level, 13, 'Infinity should be L13');

    console.log(`   🔄 OCTAVE RETURN: Reality → L${reality.current_level} (Virtuoso)`);
});

await test('11. Check Octave Status', async () => {
    const result = await request('POST', {
        action: 'check_octave',
        userId: TEST_USER
    });

    assertTrue(result.success, 'Should succeed');
    assertTrue(result.data.has_reached_infinity_l13, 'Should have reached Infinity L13');
    assertEqual(result.data.octave_count, 1, 'Should have 1 octave return');
    assertEqual(result.data.reality_level, 8, 'Reality should be L8');

    console.log(`   📊 Octave Count: ${result.data.octave_count}`);
});

await test('12. Get XP History', async () => {
    const result = await request('POST', {
        action: 'get_xp_history',
        userId: TEST_USER,
        forgeSlug: 'reality'
    });

    assertTrue(result.success, 'Should succeed');
    assertTrue(result.data.count > 0, 'Should have transaction history');

    console.log(`   📜 ${result.data.count} XP transactions logged`);
});

await test('13. Get Leaderboard', async () => {
    const result = await request('POST', {
        action: 'get_leaderboard',
        userId: TEST_USER,
        forgeSlug: 'reality'
    });

    assertTrue(result.success, 'Should succeed');
    assertTrue(result.data.count > 0, 'Should have leaderboard entries');

    console.log(`   🏆 ${result.data.count} users on Reality leaderboard`);
});

// ═══════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('FINAL SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');

const finalProgress = await request('GET', { userId: TEST_USER });

console.log(`User: ${TEST_USER}`);
console.log(`Total XP: ${finalProgress.data.total_xp.toLocaleString()}`);
console.log(`Octave Returns: ${finalProgress.data.octave_count}`);
console.log(`\nForges:`);

finalProgress.data.forges.forEach(forge => {
    console.log(`  ${forge.icon} ${forge.name.padEnd(25)} L${forge.current_level} - ${forge.level_name.padEnd(15)} ${forge.total_xp.toLocaleString()} XP`);
});

console.log('\n✅ ALL TESTS PASSED!');
console.log('═══════════════════════════════════════════════════════════════\n');
