# ARCHITECTURE_7_TRINITY_FREQUENCY_PLATFORM_v1
## C2 ARCHITECT System Design
## Location: 100X_DEPLOYMENT/
## Status: ACTIVE
## Created: 2026-02-28 | Updated: 2026-02-28
## Connects: Supabase, Cloudflare R2, Stripe
## Next: Implement database schema

---

# FREQUENCY STREAMING PLATFORM - ARCHITECTURE BLUEPRINT

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FREQUENCY PLAYER                          │
│                consciousnessrevolution.io                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Player  │  │ Artist  │  │ Admin   │  │ API     │        │
│  │ UI      │  │ Portal  │  │ Panel   │  │ Gateway │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │     Netlify Functions    │                    │
│              └────────────┬────────────┘                    │
│                           │                                  │
│    ┌──────────────────────┼──────────────────────┐          │
│    │                      │                      │          │
│    ▼                      ▼                      ▼          │
│ ┌──────┐            ┌──────────┐           ┌─────────┐     │
│ │Stripe│            │ Supabase │           │Cloudflare│     │
│ │      │            │          │           │   R2    │     │
│ └──────┘            └──────────┘           └─────────┘     │
│ Payments             Database               Audio CDN       │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Supabase)

### artists
```sql
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    stripe_account_id TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### tracks
```sql
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES artists(id),
    album_id UUID REFERENCES albums(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    frequency INTEGER, -- Hz (432, 528, etc)
    duration INTEGER, -- seconds
    file_url TEXT NOT NULL,
    file_size INTEGER,
    waveform_data JSONB,
    play_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### albums
```sql
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES artists(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_url TEXT,
    release_date DATE,
    price DECIMAL(10,2) DEFAULT 0,
    track_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### plays
```sql
CREATE TABLE plays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES tracks(id),
    user_id UUID,
    session_id TEXT,
    played_seconds INTEGER,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plays_track ON plays(track_id);
CREATE INDEX idx_plays_date ON plays(created_at);
```

### playlists
```sql
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    frequency_focus INTEGER, -- curated by Hz
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playlist_tracks (
    playlist_id UUID REFERENCES playlists(id),
    track_id UUID REFERENCES tracks(id),
    position INTEGER,
    PRIMARY KEY (playlist_id, track_id)
);
```

---

## Scaling Strategy

### Phase 1: 0-1K Users
| Component | Solution | Cost |
|-----------|----------|------|
| Audio | Netlify (100GB/mo free) | $0 |
| DB | Supabase Free | $0 |
| Functions | Netlify Free | $0 |
| **Total** | | **$0/mo** |

### Phase 2: 1K-10K Users
| Component | Solution | Cost |
|-----------|----------|------|
| Audio | Cloudflare R2 | ~$5/mo |
| DB | Supabase Pro | $25/mo |
| Functions | Netlify Pro | $19/mo |
| **Total** | | **~$50/mo** |

### Phase 3: 10K-100K Users
| Component | Solution | Cost |
|-----------|----------|------|
| Audio | R2 + Stream | ~$50/mo |
| DB | Supabase Pro | $25/mo |
| Edge | Cloudflare Workers | $5/mo |
| **Total** | | **~$100/mo** |

### Phase 4: 100K+ Users
| Component | Solution | Cost |
|-----------|----------|------|
| Audio | R2 Enterprise | ~$200/mo |
| DB | Supabase Team | $599/mo |
| Edge | Workers Pro | $200/mo |
| **Total** | | **~$1K/mo** |

---

## API Endpoints

### Public
```
GET  /api/tracks              # List tracks (paginated)
GET  /api/tracks/:id          # Single track
GET  /api/albums              # List albums
GET  /api/albums/:id          # Album with tracks
GET  /api/artists/:slug       # Artist profile
GET  /api/playlists/featured  # Curated playlists
```

### Authenticated
```
POST /api/plays               # Record play
GET  /api/me/favorites        # User favorites
POST /api/me/favorites/:id    # Add favorite
GET  /api/me/history          # Play history
```

### Artist Portal
```
GET  /api/artist/stats        # Dashboard stats
POST /api/artist/tracks       # Upload track
GET  /api/artist/revenue      # Revenue report
POST /api/artist/withdraw     # Request payout
```

---

## Security Architecture

### Audio Protection
- Signed URLs (15min expiry)
- Range request support for streaming
- No direct R2 access
- Rate limiting per session

### Auth Layers
```
User → Clerk → JWT → Supabase RLS → Data
```

### Artist Verification
1. Email verification
2. Identity check (optional)
3. First upload review
4. Stripe Connect onboarding

---

## Integration Points

| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Database | ✅ Connected |
| Stripe | Payments | ✅ Connected |
| Clerk | Auth | ✅ Deployed |
| Cloudflare R2 | Audio CDN | 🔄 Setup needed |
| Netlify | Hosting | ✅ Active |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Paint | < 1s |
| Audio Start | < 2s |
| API Response | < 200ms |
| Uptime | 99.9% |

---

*Generated by Trinity Protocol: C2 ARCHITECT*
*Pattern: 3 → 7 → 13 → ∞*
