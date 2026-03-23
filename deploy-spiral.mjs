// Deploy Spiral Engine to Supabase
const TOKEN = 'sbp_3519b93f2ce9756ce4e6883fc041ed93e1870f01';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'iadptixzmckbetwpoycq';

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

async function deploy() {
  console.log('🌀 Deploying Spiral Engine components...');

  // 1. Add missing columns to users table
  console.log('\n1. Adding columns to users table...');
  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0`);
    console.log('   ✓ total_xp');
  } catch(e) { console.log('   - total_xp (exists)'); }

  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS builder_score INTEGER DEFAULT 0`);
    console.log('   ✓ builder_score');
  } catch(e) { console.log('   - builder_score (exists)'); }

  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS consciousness_level INTEGER DEFAULT 0`);
    console.log('   ✓ consciousness_level');
  } catch(e) { console.log('   - consciousness_level (exists)'); }

  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)`);
    console.log('   ✓ stripe_customer_id');
  } catch(e) { console.log('   - stripe_customer_id (exists)'); }

  // 2. Create forges table
  console.log('\n2. Creating forges table...');
  await query(`
    CREATE TABLE IF NOT EXISTS forges (
      id INTEGER PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      slug VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      color VARCHAR(7),
      icon VARCHAR(50),
      sort_order INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('   ✓ forges table');

  // 3. Insert 7 Forges
  console.log('\n3. Inserting 7 Forges...');
  await query(`
    INSERT INTO forges (id, name, slug, description, color, icon, sort_order) VALUES
    (1, 'Reality Forge', 'reality', 'Build the foundation - consciousness, perception, truth', '#FF0000', '🔥', 1),
    (2, 'Creation Forge', 'creation', 'Create from nothing - ideation, design, manifestation', '#FF7F00', '⚡', 2),
    (3, 'Communications Forge', 'communications', 'Connect and coordinate - language, networking, influence', '#FFFF00', '📡', 3),
    (4, 'Guardian Forge', 'guardian', 'Protect what matters - security, boundaries, resilience', '#00FF00', '🛡️', 4),
    (5, 'Wealth Forge', 'wealth', 'Generate abundance - value creation, economics, systems', '#0000FF', '💰', 5),
    (6, 'Character Forge', 'character', 'Become who you are - growth, integrity, evolution', '#4B0082', '👤', 6),
    (7, 'Infinity Forge', 'infinity', 'Transcend all limits - recursion, fractals, emergence', '#9400D3', '∞', 7)
    ON CONFLICT (id) DO NOTHING
  `);
  console.log('   ✓ 7 Forges inserted');

  // 4. Create levels table
  console.log('\n4. Creating levels table...');
  await query(`
    CREATE TABLE IF NOT EXISTS levels (
      id SERIAL PRIMARY KEY,
      forge_id INTEGER NOT NULL REFERENCES forges(id) ON DELETE CASCADE,
      level_number INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      xp_required INTEGER NOT NULL,
      xp_to_next INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(forge_id, level_number),
      CHECK (level_number >= 1 AND level_number <= 13)
    )
  `);
  console.log('   ✓ levels table');

  // 5. Insert 91 levels (7 forges × 13 levels with Fibonacci XP)
  console.log('\n5. Inserting 91 levels (Fibonacci XP curve)...');
  const fib = [100, 100, 200, 300, 500, 800, 1300, 2100, 3400, 5500, 8900, 14400, 23300];
  for (let forgeId = 1; forgeId <= 7; forgeId++) {
    for (let level = 1; level <= 13; level++) {
      const xpReq = fib[level-1];
      const xpNext = level < 13 ? fib[level] - fib[level-1] : null;
      await query(`
        INSERT INTO levels (forge_id, level_number, name, xp_required, xp_to_next)
        VALUES (${forgeId}, ${level}, 'Forge ${forgeId} Level ${level}', ${xpReq}, ${xpNext || 'NULL'})
        ON CONFLICT (forge_id, level_number) DO NOTHING
      `);
    }
    console.log(`   ✓ Forge ${forgeId} levels`);
  }

  // 6. Create forge_progress table
  console.log('\n6. Creating forge_progress table...');
  await query(`
    CREATE TABLE IF NOT EXISTS forge_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      forge_id INTEGER NOT NULL REFERENCES forges(id) ON DELETE CASCADE,
      current_level INTEGER NOT NULL DEFAULT 0,
      current_xp INTEGER NOT NULL DEFAULT 0,
      total_xp_earned INTEGER NOT NULL DEFAULT 0,
      is_unlocked BOOLEAN DEFAULT false,
      unlocked_at TIMESTAMP WITH TIME ZONE,
      last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, forge_id)
    )
  `);
  console.log('   ✓ forge_progress table');

  // 7. Create purchases table
  console.log('\n7. Creating purchases table...');
  await query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id VARCHAR(255) NOT NULL,
      product_name VARCHAR(255),
      forge_id INTEGER REFERENCES forges(id),
      stripe_session_id VARCHAR(255) UNIQUE,
      stripe_payment_intent VARCHAR(255),
      amount_cents INTEGER NOT NULL,
      currency VARCHAR(3) DEFAULT 'usd',
      status VARCHAR(50) DEFAULT 'pending',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE
    )
  `);
  console.log('   ✓ purchases table');

  // 8. Create stored function for adding XP
  console.log('\n8. Creating add_forge_xp function...');
  await query(`
    CREATE OR REPLACE FUNCTION add_forge_xp(
      p_user_id UUID,
      p_forge_id INTEGER,
      p_xp_amount INTEGER,
      p_source VARCHAR(100) DEFAULT 'manual'
    ) RETURNS TABLE(
      leveled_up BOOLEAN,
      old_level INTEGER,
      new_level INTEGER,
      new_xp INTEGER,
      unlocked_forges INTEGER[]
    ) AS $$
    DECLARE
      v_current_level INTEGER;
      v_current_xp INTEGER;
      v_new_xp INTEGER;
      v_new_level INTEGER;
      v_level_xp_req INTEGER;
      v_leveled_up BOOLEAN := false;
      v_unlocked_forges INTEGER[] := ARRAY[]::INTEGER[];
    BEGIN
      SELECT current_level, current_xp INTO v_current_level, v_current_xp
      FROM forge_progress WHERE user_id = p_user_id AND forge_id = p_forge_id;

      v_new_xp := COALESCE(v_current_xp, 0) + p_xp_amount;
      v_new_level := COALESCE(v_current_level, 0);

      LOOP
        IF v_new_level >= 13 THEN EXIT; END IF;
        SELECT xp_required INTO v_level_xp_req FROM levels WHERE forge_id = p_forge_id AND level_number = v_new_level + 1;
        IF v_new_xp >= v_level_xp_req THEN
          v_new_level := v_new_level + 1;
          v_leveled_up := true;
        ELSE
          EXIT;
        END IF;
      END LOOP;

      UPDATE forge_progress SET
        current_level = v_new_level,
        current_xp = v_new_xp,
        total_xp_earned = total_xp_earned + p_xp_amount,
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE user_id = p_user_id AND forge_id = p_forge_id;

      UPDATE users SET total_xp = COALESCE(total_xp, 0) + p_xp_amount WHERE id = p_user_id;

      IF p_forge_id = 1 AND v_new_level >= 7 THEN
        UPDATE forge_progress SET is_unlocked = true, unlocked_at = NOW()
        WHERE user_id = p_user_id AND forge_id > 1 AND is_unlocked = false;
        SELECT ARRAY_AGG(forge_id) INTO v_unlocked_forges FROM forge_progress
        WHERE user_id = p_user_id AND forge_id > 1 AND unlocked_at = NOW();
      END IF;

      RETURN QUERY SELECT v_leveled_up, COALESCE(v_current_level, 0), v_new_level, v_new_xp, v_unlocked_forges;
    END;
    $$ LANGUAGE plpgsql
  `);
  console.log('   ✓ add_forge_xp function');

  // 9. Create get_user_progress function
  console.log('\n9. Creating get_user_progress function...');
  await query(`
    CREATE OR REPLACE FUNCTION get_user_progress(p_user_id UUID)
    RETURNS TABLE(
      forge_id INTEGER,
      forge_name VARCHAR(50),
      forge_slug VARCHAR(50),
      forge_color VARCHAR(7),
      forge_icon VARCHAR(50),
      current_level INTEGER,
      current_xp INTEGER,
      total_xp_earned INTEGER,
      is_unlocked BOOLEAN,
      unlocked_at TIMESTAMP WITH TIME ZONE,
      next_level_xp INTEGER,
      progress_percent INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        f.id, f.name, f.slug, f.color, f.icon,
        COALESCE(fp.current_level, 0),
        COALESCE(fp.current_xp, 0),
        COALESCE(fp.total_xp_earned, 0),
        COALESCE(fp.is_unlocked, false),
        fp.unlocked_at,
        CASE WHEN fp.current_level < 13 THEN l.xp_required - fp.current_xp ELSE 0 END,
        CASE WHEN fp.current_level < 13 THEN ROUND((fp.current_xp::NUMERIC / l.xp_required::NUMERIC) * 100)::INTEGER ELSE 100 END
      FROM forges f
      LEFT JOIN forge_progress fp ON f.id = fp.forge_id AND fp.user_id = p_user_id
      LEFT JOIN levels l ON f.id = l.forge_id AND l.level_number = COALESCE(fp.current_level, 0) + 1
      ORDER BY f.sort_order;
    END;
    $$ LANGUAGE plpgsql
  `);
  console.log('   ✓ get_user_progress function');

  // 10. Verify
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 VERIFICATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const forges = await query('SELECT id, name, icon FROM forges ORDER BY id');
  console.log('\n7 Forges:');
  forges.forEach(f => console.log(`   ${f.icon} ${f.name}`));

  const levels = await query('SELECT COUNT(*) as cnt FROM levels');
  console.log(`\nLevels: ${levels[0].cnt}/91`);

  const tables = await query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('forges', 'levels', 'forge_progress', 'purchases') ORDER BY table_name`);
  console.log('\nTables:', tables.map(t => t.table_name).join(', '));

  console.log('\n✅ SPIRAL ENGINE DEPLOYED TO SUPABASE!');
}

deploy().catch(e => console.error('Error:', e.message));
