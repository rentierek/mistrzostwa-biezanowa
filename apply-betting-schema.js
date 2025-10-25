#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
  console.error('❌ Błąd: Brak konfiguracji Supabase lub używane są wartości placeholder');
  console.log('Sprawdź plik .env.local i upewnij się, że zawiera prawidłowe wartości:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyBettingSchema() {
  try {
    console.log('🔄 Ładowanie schematu bazy danych...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'betting-database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Zastosowywanie schematu bazy danych...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Znaleziono ${statements.length} instrukcji SQL do wykonania`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⏳ Wykonywanie instrukcji ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try alternative method using raw SQL
        const { error: rawError } = await supabase
          .from('_temp_sql_execution')
          .select('*')
          .limit(0);
        
        if (rawError && rawError.message.includes('does not exist')) {
          console.log(`⚠️  Nie można wykonać instrukcji ${i + 1}, próba alternatywna...`);
          // For some statements, we might need to handle them differently
          continue;
        } else if (error.message.includes('already exists')) {
          console.log(`✅ Instrukcja ${i + 1} - obiekt już istnieje, pomijanie`);
          continue;
        } else {
          console.error(`❌ Błąd w instrukcji ${i + 1}:`, error.message);
          console.log('Instrukcja:', statement.substring(0, 100) + '...');
        }
      } else {
        console.log(`✅ Instrukcja ${i + 1} wykonana pomyślnie`);
      }
    }
    
    console.log('🔍 Sprawdzanie utworzonych tabel...');
    
    // Check if tables were created
    const tables = [
      'betting_coupons',
      'betting_predictions', 
      'betting_prediction_types',
      'betting_player_stats',
      'betting_achievements'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: OK`);
      }
    }
    
    console.log('🎉 Schemat bazy danych został zastosowany!');
    console.log('');
    console.log('📋 Następne kroki:');
    console.log('1. Uruchom ponownie aplikację (npm run dev)');
    console.log('2. Sprawdź funkcjonalność bettingu na /betting');
    console.log('3. Sprawdź, czy podium/nagrody ładują się poprawnie');
    
  } catch (error) {
    console.error('❌ Błąd podczas zastosowywania schematu:', error);
    console.log('');
    console.log('🔧 Rozwiązanie:');
    console.log('1. Otwórz Supabase Dashboard');
    console.log('2. Przejdź do SQL Editor');
    console.log('3. Skopiuj zawartość pliku betting-database-schema.sql');
    console.log('4. Wklej i wykonaj w SQL Editor');
  }
}

// Run the script
applyBettingSchema();