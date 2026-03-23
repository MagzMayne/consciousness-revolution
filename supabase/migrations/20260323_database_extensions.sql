-- ============================================================
-- Database Extensions Migration
-- Created: 2026-03-23
-- Purpose: Enable all required PostgreSQL extensions for the
--          Consciousness Revolution platform.
--
-- Extensions are grouped by dependency order so that
-- prerequisites are always created before dependents.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Core / Procedural Languages
-- (plpgsql is a built-in and is always present; listed for
--  documentation purposes only – no CREATE is needed)
-- ────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- Cryptography & Security
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;
CREATE EXTENSION IF NOT EXISTS pgaudit WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;          -- Deprecated but still enabled
CREATE EXTENSION IF NOT EXISTS sslinfo WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- UUID Generation
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Data Types & Type Support
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS cube WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS seg WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS isn WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS intarray WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Text Search & String Utilities
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS dict_int WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS dict_xsyn WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA tiger;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Full-Text Search (PGroonga – requires its own schema order)
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgroonga WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgroonga_database WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Indexing & Access Methods
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS bloom WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS rum WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS hypopg WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS index_advisor WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Table Sampling Methods
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS tsm_system_rows WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS tsm_system_time WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- JSON / Schema Validation
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_jsonschema WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Hashing & Identifiers
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_hashids WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Auditing & Change Tracking
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS insert_username WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS tcn WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS autoinc WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS refint WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Statistics & Monitoring
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgstattuple WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgrowlocks WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_walinspect WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_prewarm WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS plpgsql_check WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Table Management & Partitioning
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_partman WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_repack WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Networking & HTTP
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS postgres_fdw WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Job Scheduling
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Message Queue
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgmq WITH SCHEMA pgmq;

-- ────────────────────────────────────────────────────────────
-- GraphQL Support
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;

-- ────────────────────────────────────────────────────────────
-- Testing
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- Geospatial – PostGIS (order matters: core → topology/raster
-- → tiger geocoder → routing → SFCGAL)
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;
CREATE EXTENSION IF NOT EXISTS postgis_raster WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS address_standardizer WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS address_standardizer_data_us WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;
CREATE EXTENSION IF NOT EXISTS postgis_sfcgal WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgrouting WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS earthdistance WITH SCHEMA extensions;
