# A7: ARAYA Image Storage DNA Blueprint

**Status:** COMPLETE (code exists, schema created)
**Created:** 2026-02-08
**Domain:** 2_BUILD
**Phase:** GROW

---

## PURPOSE

Enable ARAYA to store, recall, and search user images via Supabase. Images are auto-tagged for intelligent retrieval.

---

## ARCHITECTURE

```
User uploads image → Claude Vision analyzes → Auto-tags extracted → Stored to Supabase
                                                                          ↓
User asks "show my images" ← Filtered by user_id ← Query Supabase ← Recall triggered
```

---

## FILES

| File | Purpose |
|------|---------|
| `netlify/functions/araya-chat.mjs` | Main backend with storeImageToSupabase(), recallUserImages() |
| `supabase/migrations/001_user_images.sql` | Database schema |
| `ARAYA_ABILITY_DIAGNOSTICS.html` | Testing interface |

---

## SUPABASE TABLE: user_images

```sql
CREATE TABLE user_images (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_base64 TEXT NOT NULL,
    mime_type TEXT DEFAULT 'image/png',
    description TEXT,
    tags TEXT[] DEFAULT ARRAY['untagged'],
    source TEXT DEFAULT 'araya_chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_user_images_user_id` - Fast user lookup
- `idx_user_images_tags` - GIN for tag containment
- `idx_user_images_description` - Full text search
- `idx_user_images_created` - Timestamp ordering

---

## AUTO-TAG KEYWORDS

The system extracts tags from image descriptions:
- **Legal:** court, document, legal, evidence
- **Media:** photo, screenshot
- **Categories:** family, work, medical, financial, property, vehicle
- **Documents:** receipt, contract, letter
- **Content:** text, handwritten, diagram, map, person, building

---

## ABILITIES

### image_recall
**Triggers:** "show my images", "show my photos", "what images do i have"
**Function:** `recallUserImages(userId, query, limit)`
**Returns:** List of images with id, description, tags, created_at

### image_search
**Triggers:** "find images of", "search my images for"
**Function:** `recallUserImages(userId, searchQuery)`
**Returns:** Filtered images matching query in description or tags

---

## ENV VARIABLES REQUIRED

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_SECRET=your-service-role-key
```

---

## DEPLOYMENT STEPS

1. Run migration in Supabase SQL editor:
   ```
   Copy contents of supabase/migrations/001_user_images.sql
   Execute in Supabase Dashboard → SQL Editor
   ```

2. Set environment variables in Netlify:
   - Site Settings → Environment Variables
   - Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_SECRET

3. Redeploy to pick up env vars

---

## TESTING

1. Open: https://consciousnessrevolution.io/ARAYA_ABILITY_DIAGNOSTICS.html
2. Click TEST on "Image Recall" and "Image Search" cards
3. Or use araya-chat directly:
   - Upload an image and describe it
   - Say "show my images" to recall
   - Say "find images of documents" to search

---

## CONNECTIONS

- **A6 Screenshot** → Screenshots can be stored via this system
- **A8 Case Builder** → Legal evidence images stored here
- **Cyclotron Brain** → Image metadata can sync to atoms

---

## NEXT STEPS (A8)

After A7 is verified working:
- A8: ARAYA Case Builder - Organize evidence images into case folders
- Add image_to_case ability
- Build case timeline from image timestamps

---

*Pattern: 3 → 7 → 13 → ∞*
