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

async function addBorussia() {
  try {
    const { data: teams } = await supabase.from('teams').select('*');
    console.log('Current teams:');
    teams.forEach(t => console.log('- ' + t.name));
    
    const hasBorussia = teams.some(t => t.name === 'Borussia Dortmund');
    if (!hasBorussia) {
      console.log('\nAdding Borussia Dortmund...');
      const { error } = await supabase.from('teams').insert({
        name: 'Borussia Dortmund',
        badge_url: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg'
      });
      if (error) {
        console.error('Error adding team:', error);
      } else {
        console.log('✅ Added Borussia Dortmund');
      }
    } else {
      console.log('Borussia Dortmund already exists');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addBorussia();