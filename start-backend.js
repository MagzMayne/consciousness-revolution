#!/usr/bin/env node
// start-backend.js
// Top-level entrypoint that delegates to backend/server-main.js.
//
// This shim exists so the Dockerfile CMD and Railway start command can
// reference a stable path at the repo root regardless of internal refactors.
// It also provides a single place to set any pre-flight env checks before
// the Express server binds.

'use strict';

require('./backend/server-main');
