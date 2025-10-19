const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  return envVars;
}

const envVars = loadEnvFile();
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixBorussiaDortmundLogo() {
  try {
    console.log('🔍 Searching for Borussia Dortmund team...');
    
    const { data: teams, error: fetchError } = await supabase
      .from('teams')
      .select('*')
      .eq('name', 'Borussia Dortmund');
    
    if (fetchError) {
      console.error('❌ Error fetching teams:', fetchError);
      return;
    }
    
    if (teams.length === 0) {
      console.log('❌ Borussia Dortmund team not found in database');
      return;
    }
    
    const team = teams[0];
    console.log(`📋 Found team: ${team.name} (ID: ${team.id})`);
    console.log(`🔗 Current badge URL: ${team.badge_url || 'None'}`);
    
    const newBadgeUrl = 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg';
    
    console.log('🔄 Updating badge URL...');
    const { error: updateError } = await supabase
      .from('teams')
      .update({ badge_url: newBadgeUrl })
      .eq('id', team.id);
    
    if (updateError) {
      console.error('❌ Error updating team:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated Borussia Dortmund logo!');
    console.log(`🔗 New badge URL: ${newBadgeUrl}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixBorussiaDortmundLogo();