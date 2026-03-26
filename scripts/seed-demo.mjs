import { createClient } from '@supabase/supabase-js';

// Credentials found in utils/supabase/info.tsx
const projectId = "uyfmjxhwwsvtmjykynqx"
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Zm1qeGh3d3N2dG1qeWt5bnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzY0MDAsImV4cCI6MjA4ODgxMjQwMH0.StVHeUqkhvBghac24LW5WMmuBB7Ze8haz_IYogN-PYI"
const supabaseUrl = `https://${projectId}.supabase.co`;

const supabase = createClient(supabaseUrl, publicAnonKey);
const API_BASE = `${supabaseUrl}/functions/v1/make-server-6b47184d`;

async function signup(email, password, name, role) {
  try {
    console.log(`Creating demo ${role}...`);
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name, role })
    });

    const bodyText = await response.text();
    console.log(`Raw response for ${role}:`, response.status, bodyText);
    
    if (!response.ok) {
      throw new Error('Signup failed');
    }

    console.log(`[SUCCESS] Created ${role} (${email})`);
  } catch (err) {
    console.error(`[ERROR] Failed to create demo ${role}:`, err.message);
  }
}

async function run() {
  await signup('demo@customer.com', 'password123', 'Demo Customer', 'customer');
}

run();
