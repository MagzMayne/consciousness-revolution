// SMS Webhook - Receives inbound Twilio SMS and routes to Cyclotron
// POST from Twilio: Form data with From, Body, MessageSid
// Stores bugs in Supabase and can trigger notifications

import { createClient } from "@supabase/supabase-js";

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL || "https://lgibygzcbvrrykfaxvbg.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Known team phone numbers (for priority routing)
const TEAM_NUMBERS = {
  "+15094968855": { name: "Commander", priority: "critical" },
  "+14256289888": { name: "Maggie", priority: "high" },
  "+12674439742": { name: "Josh S", priority: "high" },
  "+13463083078": { name: "Teddy", priority: "high" },
  "+15094963855": { name: "Josh B", priority: "normal" }
};

export const handler = async (event, context) => {
  // TwiML response header
  const headers = {
    "Content-Type": "text/xml",
    "Access-Control-Allow-Origin": "*"
  };

  // Handle GET (webhook verification)
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: "SMS Webhook Active - Consciousness Revolution"
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Method not allowed</Message></Response>'
    };
  }

  try {
    // Parse Twilio form data
    const params = new URLSearchParams(event.body);
    const from = params.get("From");
    const body = params.get("Body");
    const messageSid = params.get("MessageSid");
    const numMedia = parseInt(params.get("NumMedia") || "0");

    if (!from || !body) {
      return {
        statusCode: 400,
        headers,
        body: '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Missing required fields</Message></Response>'
      };
    }

    // Detect message type
    const lowerBody = body.toLowerCase();
    let messageType = "general";
    let priority = "normal";

    if (lowerBody.includes("bug") || lowerBody.includes("broken") || lowerBody.includes("error")) {
      messageType = "bug";
      priority = "high";
    } else if (lowerBody.includes("urgent") || lowerBody.includes("critical") || lowerBody.includes("emergency")) {
      messageType = "urgent";
      priority = "critical";
    } else if (lowerBody.includes("idea") || lowerBody.includes("suggest") || lowerBody.includes("feature")) {
      messageType = "idea";
    } else if (lowerBody.includes("help") || lowerBody.includes("how do") || lowerBody.includes("?")) {
      messageType = "question";
    }

    // Check if from known team member
    const teamMember = TEAM_NUMBERS[from];
    if (teamMember) {
      if (teamMember.priority === "critical" && priority === "normal") {
        priority = "high";
      }
    }

    // Build record
    const record = {
      from_number: from,
      message: body,
      message_sid: messageSid,
      message_type: messageType,
      priority: priority,
      has_media: numMedia > 0,
      sender_name: teamMember?.name || "Unknown",
      processed: false,
      created_at: new Date().toISOString()
    };

    // Store in Supabase if available
    let stored = false;
    if (SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase
          .from("sms_inbox")
          .insert([record]);

        if (!error) {
          stored = true;
        } else {
          console.error("Supabase error:", error);
        }
      } catch (e) {
        console.error("Supabase connection error:", e.message);
      }
    }

    // Build response message
    let responseMessage;
    if (messageType === "bug") {
      responseMessage = "Bug received! Team has been notified.";
    } else if (messageType === "urgent") {
      responseMessage = "URGENT message received! Escalating immediately.";
    } else if (messageType === "idea") {
      responseMessage = "Great idea! Added to our feature backlog.";
    } else if (messageType === "question") {
      responseMessage = "Question received! Someone will respond shortly.";
    } else {
      responseMessage = "Message received! Thanks for reaching out.";
    }

    // Log for debugging
    console.log("SMS received:", {
      from,
      type: messageType,
      priority,
      stored,
      preview: body.substring(0, 50)
    });

    // TwiML response
    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>' + responseMessage + '</Message></Response>';

    return {
      statusCode: 200,
      headers,
      body: twiml
    };

  } catch (error) {
    console.error("SMS webhook error:", error);

    return {
      statusCode: 500,
      headers,
      body: '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error processing message.</Message></Response>'
    };
  }
};
