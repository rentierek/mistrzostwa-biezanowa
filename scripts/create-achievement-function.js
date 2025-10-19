const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
let supabaseUrl, supabaseKey;
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.error('❌ Error reading .env.local file:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAchievementFunction() {
  console.log('🔧 Creating award_tournament_achievements function...');
  
  try {
    // Read the database schema file
    const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract just the award_tournament_achievements function
    const functionStart = schemaContent.indexOf('CREATE OR REPLACE FUNCTION award_tournament_achievements');
    const functionEnd = schemaContent.indexOf('$$ LANGUAGE plpgsql;', functionStart) + '$$ LANGUAGE plpgsql;'.length;
    
    if (functionStart === -1 || functionEnd === -1) {
      console.error('❌ Could not find award_tournament_achievements function in schema file');
      return;
    }
    
    const functionSQL = schemaContent.substring(functionStart, functionEnd);
    
    console.log('📝 Executing function creation SQL...');
    console.log('Function SQL preview:', functionSQL.substring(0, 200) + '...');
    
    // Execute the function creation SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: functionSQL
    });
    
    if (error) {
      console.error('❌ Error creating function via rpc:', error);
      
      // Try alternative approach using raw SQL
      console.log('🔄 Trying alternative approach...');
      
      // Since we can't execute DDL directly, let's provide instructions
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('The award_tournament_achievements function needs to be created manually in your Supabase database.');
      console.log('\n🔧 Steps to fix:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the following SQL:');
      console.log('\n--- SQL TO EXECUTE ---');
      console.log(functionSQL);
      console.log('--- END SQL ---\n');
      console.log('4. Run the SQL query');
      console.log('5. Test achievement generation again');
      
    } else {
      console.log('✅ Function created successfully!');
      console.log('📊 Result:', data);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    // Provide manual instructions as fallback
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('Please create the award_tournament_achievements function manually in your Supabase database.');
    console.log('The function definition can be found in database-schema.sql');
  }
}

createAchievementFunction();