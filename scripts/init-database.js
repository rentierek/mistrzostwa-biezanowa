// Skrypt do inicjalizacji bazy danych z podstawowymi danymi
// Uruchom: node scripts/init-database.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Odczytaj zmienne z .env.local
function loadEnvFile() {
  try {
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
  } catch (error) {
    console.error('❌ Nie można odczytać pliku .env.local:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();

// Konfiguracja Supabase
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
  console.error('❌ Błąd: Brak konfiguracji Supabase lub używasz placeholder\'ów');
  console.log('Sprawdź plik .env.local i upewnij się, że zawiera prawdziwe dane Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Podstawowi gracze
const players = [
  { nickname: 'Bartus', email: 'bartus@example.com' },
  { nickname: 'Grzesiu', email: 'grzesiu@example.com' },
  { nickname: 'Kula', email: 'kula@example.com' },
  { nickname: 'Sebus', email: 'sebus@example.com' },
  { nickname: 'Karol', email: 'karol@example.com' },
  { nickname: 'Wilku', email: 'wilku@example.com' },
  { nickname: 'Mati', email: 'mati@example.com' },
  { nickname: 'Michu', email: 'michu@example.com' }
];

// Podstawowe drużyny
const teams = [
  { name: 'Real Madrid', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png' },
  { name: 'FC Barcelona', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png' },
  { name: 'Manchester City', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png' },
  { name: 'Bayern Munich', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png' },
  { name: 'Liverpool FC', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png' },
  { name: 'Paris Saint-Germain', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-Logo.png' },
  { name: 'Juventus', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png' },
  { name: 'Arsenal FC', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png' },
  { name: 'Chelsea FC', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png' },
  { name: 'Manchester United', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png' },
  { name: 'AC Milan', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png' },
  { name: 'Atletico Madrid', badge_url: 'https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png' }
];

async function initDatabase() {
  console.log('🚀 Inicjalizacja bazy danych...');

  try {
    // Sprawdź połączenie z bazą danych
    const { data: testData, error: testError } = await supabase
      .from('players')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Błąd połączenia z bazą danych:', testError.message);
      return;
    }

    console.log('✅ Połączenie z bazą danych OK');

    // Dodaj graczy
    console.log('👥 Dodawanie graczy...');
    for (const player of players) {
      const { data, error } = await supabase
        .from('players')
        .insert([player])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Gracz ${player.nickname} już istnieje`);
        } else {
          console.error(`❌ Błąd dodawania gracza ${player.nickname}:`, error.message);
        }
      } else {
        console.log(`✅ Dodano gracza: ${data.nickname} (ID: ${data.id})`);
      }
    }

    // Dodaj drużyny
    console.log('⚽ Dodawanie drużyn...');
    for (const team of teams) {
      const { data, error } = await supabase
        .from('teams')
        .insert([team])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Drużyna ${team.name} już istnieje`);
        } else {
          console.error(`❌ Błąd dodawania drużyny ${team.name}:`, error.message);
        }
      } else {
        console.log(`✅ Dodano drużynę: ${data.name} (ID: ${data.id})`);
      }
    }

    // Pokaż statystyki
    const { data: playersCount } = await supabase
      .from('players')
      .select('id', { count: 'exact' });

    const { data: teamsCount } = await supabase
      .from('teams')
      .select('id', { count: 'exact' });

    const { data: tournamentsCount } = await supabase
      .from('tournaments')
      .select('id', { count: 'exact' });

    console.log('\n📊 Statystyki bazy danych:');
    console.log(`👥 Gracze: ${playersCount?.length || 0}`);
    console.log(`⚽ Drużyny: ${teamsCount?.length || 0}`);
    console.log(`🏆 Turnieje: ${tournamentsCount?.length || 0}`);

    console.log('\n🎉 Inicjalizacja zakończona pomyślnie!');
    console.log('💡 Możesz teraz używać panelu administratora do tworzenia turniejów.');

  } catch (error) {
    console.error('❌ Błąd podczas inicjalizacji:', error);
  }
}

// Uruchom inicjalizację
initDatabase();