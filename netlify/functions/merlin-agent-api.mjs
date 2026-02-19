/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Merlin Hive Agent API
 * 
 * Netlify Function for autonomous agent operations
 * 
 * ENDPOINTS:
 * - POST /agent/spawn - Create new agent
 * - GET /agent/:id - Get agent status
 * - POST /agent/:id/task - Assign task to agent
 * - GET /agent/:id/jobs - Get agent job history
 * - POST /agent/:id/retire - Retire agent
 * - GET /agents/list - List all agents
 * - GET /agents/health - System health check
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Main handler
 */
export async function handler(event, context) {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_SECRET;

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Supabase not configured',
        message: 'Please set SUPABASE_URL and SUPABASE_KEY environment variables'
      })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Parse request
    const path = event.path.replace('/.netlify/functions/merlin-agent-api', '');
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    // Route handler
    let result;

    if (path === '/spawn' && method === 'POST') {
      result = await spawnAgent(supabase, body);
    } else if (path.match(/^\/agent\/[\w-]+$/) && method === 'GET') {
      const agentId = path.split('/')[2];
      result = await getAgentStatus(supabase, agentId);
    } else if (path.match(/^\/agent\/[\w-]+\/task$/) && method === 'POST') {
      const agentId = path.split('/')[2];
      result = await assignTask(supabase, agentId, body);
    } else if (path.match(/^\/agent\/[\w-]+\/jobs$/) && method === 'GET') {
      const agentId = path.split('/')[2];
      result = await getAgentJobs(supabase, agentId);
    } else if (path.match(/^\/agent\/[\w-]+\/retire$/) && method === 'POST') {
      const agentId = path.split('/')[2];
      result = await retireAgent(supabase, agentId);
    } else if (path === '/agents/list' && method === 'GET') {
      result = await listAgents(supabase);
    } else if (path === '/agents/health' && method === 'GET') {
      result = await healthCheck(supabase);
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Merlin Agent API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}

/**
 * Spawn a new agent
 */
async function spawnAgent(supabase, params) {
  const { agentType, config = {} } = params;

  if (!agentType) {
    throw new Error('agentType is required');
  }

  const agentId = `${agentType}-${Date.now()}`;

  const { data, error } = await supabase
    .from('merlin_agents')
    .insert({
      agent_id: agentId,
      agent_type: agentType,
      state: { initialized: true, spawnedAt: new Date().toISOString() },
      config: config,
      status: 'active',
      capabilities: getAgentCapabilities(agentType)
    })
    .select()
    .single();

  if (error) throw error;

  // Log audit entry
  await supabase.from('merlin_audit_logs').insert({
    agent_id: agentId,
    event_type: 'agent_spawned',
    event_data: { agentType, config }
  });

  return {
    success: true,
    agent: data,
    message: `Agent ${agentId} spawned successfully`
  };
}

/**
 * Get agent status
 */
async function getAgentStatus(supabase, agentId) {
  const { data, error } = await supabase
    .from('merlin_agents')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (error) throw error;

  if (!data) {
    throw new Error(`Agent ${agentId} not found`);
  }

  // Get recent jobs
  const { data: jobs } = await supabase
    .from('merlin_jobs')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    success: true,
    agent: data,
    recentJobs: jobs || []
  };
}

/**
 * Assign task to agent
 */
async function assignTask(supabase, agentId, taskData) {
  const { taskType, priority = 5, data: taskPayload = {} } = taskData;

  if (!taskType) {
    throw new Error('taskType is required');
  }

  // Verify agent exists
  const { data: agent, error: agentError } = await supabase
    .from('merlin_agents')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (agentError || !agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  // Create job
  const { data, error } = await supabase
    .from('merlin_jobs')
    .insert({
      agent_id: agentId,
      job_type: taskType,
      job_data: taskPayload,
      status: 'pending',
      priority: priority
    })
    .select()
    .single();

  if (error) throw error;

  // Log audit entry
  await supabase.from('merlin_audit_logs').insert({
    agent_id: agentId,
    event_type: 'task_assigned',
    event_data: { taskType, priority }
  });

  return {
    success: true,
    job: data,
    message: `Task assigned to ${agentId}`
  };
}

/**
 * Get agent job history
 */
async function getAgentJobs(supabase, agentId) {
  const { data, error } = await supabase
    .from('merlin_jobs')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return {
    success: true,
    jobs: data || [],
    count: data?.length || 0
  };
}

/**
 * Retire agent
 */
async function retireAgent(supabase, agentId) {
  const { data, error } = await supabase
    .from('merlin_agents')
    .update({ status: 'retired', last_updated: new Date().toISOString() })
    .eq('agent_id', agentId)
    .select()
    .single();

  if (error) throw error;

  // Log audit entry
  await supabase.from('merlin_audit_logs').insert({
    agent_id: agentId,
    event_type: 'agent_retired',
    event_data: { retiredAt: new Date().toISOString() }
  });

  return {
    success: true,
    agent: data,
    message: `Agent ${agentId} retired`
  };
}

/**
 * List all agents
 */
async function listAgents(supabase) {
  const { data, error } = await supabase
    .from('merlin_agents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    success: true,
    agents: data || [],
    count: data?.length || 0
  };
}

/**
 * Health check
 */
async function healthCheck(supabase) {
  try {
    // Check database connection
    const { count, error } = await supabase
      .from('merlin_agents')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    // Get system stats
    const { data: activeAgents } = await supabase
      .from('merlin_agents')
      .select('*')
      .eq('status', 'active');

    const { data: pendingJobs } = await supabase
      .from('merlin_jobs')
      .select('*')
      .eq('status', 'pending');

    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats: {
        totalAgents: count || 0,
        activeAgents: activeAgents?.length || 0,
        pendingJobs: pendingJobs?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get agent capabilities by type
 */
function getAgentCapabilities(agentType) {
  const capabilities = {
    seeker: ['job-search', 'opportunity-detection', 'role-analysis'],
    applicant: ['application-submission', 'resume-generation', 'cover-letter'],
    interview: ['interview-scheduling', 'question-preparation', 'follow-up'],
    builder: ['project-execution', 'code-generation', 'testing'],
    negotiator: ['contract-review', 'rate-negotiation', 'approval-process'],
    finops: ['payment-processing', 'invoice-generation', 'expense-tracking'],
    learner: ['pattern-analysis', 'knowledge-extraction', 'insight-generation'],
    enhancer: ['code-improvement', 'performance-optimization', 'bug-detection'],
    documenter: ['auto-commenting', 'documentation-generation', 'api-docs']
  };

  return capabilities[agentType] || [];
}
