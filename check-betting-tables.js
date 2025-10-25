const { createClient } = require('@supabase/supabase-js');

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('placeholder');

if (isDemoMode) {
  console.log('🔄 Aplikacja działa w trybie demo - tabele betting nie są wymagane');
  process.exit(0);
}

// Try to read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️  Brak konfiguracji Supabase - sprawdź plik .env.local');
  console.log('Aplikacja prawdopodobnie działa w trybie demo');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBettingTables() {
  console.log('Sprawdzanie tabel betting w Supabase...');
  
  const tables = [
    'betting_coupons',
    'betting_predictions', 
    'betting_prediction_types',
    'betting_player_stats',
    'betting_achievements'
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table} nie istnieje:`, error.message);
        allTablesExist = false;
      } else {
        console.log(`✅ Tabela ${table} istnieje`);
      }
    } catch (err) {
      console.log(`❌ Błąd sprawdzania tabeli ${table}:`, err.message);
      allTablesExist = false;
    }
  }
  
  if (allTablesExist) {
    console.log('\n🎉 Wszystkie tabele betting istnieją w bazie danych!');
  } else {
    console.log('\n⚠️  Niektóre tabele betting nie istnieją. Uruchom schemat betting-database-schema.sql w Supabase.');
  }
}

checkBettingTables().catch(console.error);
