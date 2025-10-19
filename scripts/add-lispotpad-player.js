const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addLispotpadPlayer() {
  try {
    console.log('🔍 Adding missing player "lispotpad"...');
    
    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('nickname', 'lispotpad')
      .single();
    
    if (existingPlayer) {
      console.log('✅ Player "lispotpad" already exists');
      return existingPlayer;
    }
    
    // Add the player
    const { data: newPlayer, error: playerError } = await supabase
      .from('players')
      .insert([{
        nickname: 'lispotpad',
        email: 'lispotpad@example.com'
      }])
      .select()
      .single();
    
    if (playerError) {
      console.error('❌ Error adding player:', playerError.message);
      return null;
    }
    
    console.log('✅ Successfully added player "lispotpad"');
    console.log('   Player ID:', newPlayer.id);
    
    return newPlayer;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return null;
  }
}

async function main() {
  const player = await addLispotpadPlayer();
  
  if (player) {
    console.log('\n📊 Current players in database:');
    
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .order('nickname');
    
    if (allPlayers) {
      allPlayers.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.nickname}`);
      });
    }
  }
}

main();