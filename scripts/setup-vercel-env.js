#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to automatically configure Vercel environment variables
 * from your local .env.local file
 */

const ENV_FILE = path.join(__dirname, '..', '.env.local');

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ .env.local file not found!');
    console.log('Please make sure you have a .env.local file with your environment variables.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
      if (key && value) {
        envVars[key] = value;
      }
    }
  });

  return envVars;
}

function runVercelCommand(command) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    console.error(`❌ Failed to run: ${command}`);
    console.error(error.message);
    throw error;
  }
}

function setVercelEnvVar(key, value, environments = ['production', 'preview', 'development']) {
  console.log(`Setting ${key}...`);
  
  for (const env of environments) {
    try {
      const command = `vercel env add ${key} ${env} --force`;
      execSync(command, { 
        input: value + '\n',
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`  ✅ Set for ${env}`);
    } catch (error) {
      console.error(`  ❌ Failed to set for ${env}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Setting up Vercel environment variables...\n');

  // Check if user is logged in to Vercel
  try {
    runVercelCommand('vercel whoami');
  } catch (error) {
    console.log('❌ Not logged in to Vercel. Please run: vercel login');
    process.exit(1);
  }

  // Check if project is linked
  try {
    runVercelCommand('vercel project ls --limit 1');
  } catch (error) {
    console.log('❌ Project not linked to Vercel. Please run: vercel --confirm');
    process.exit(1);
  }

  const envVars = readEnvFile();
  
  // Define which environment variables to copy to Vercel
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_BUCKET',
    'SUPABASE_JWT_SECRET'
  ];

  const optionalVars = [
    'SUPERADMIN_EMAIL',
    'SETUP_TOKEN'
  ];

  console.log('📋 Found environment variables in .env.local:');
  Object.keys(envVars).forEach(key => {
    const value = envVars[key];
    const masked = value.length > 10 ? value.substring(0, 8) + '...' : value;
    console.log(`  ${key}=${masked}`);
  });
  console.log();

  // Set required variables
  console.log('🔧 Setting required environment variables:\n');
  for (const varName of requiredVars) {
    if (envVars[varName]) {
      setVercelEnvVar(varName, envVars[varName]);
    } else {
      console.log(`⚠️  Warning: ${varName} not found in .env.local`);
    }
    console.log();
  }

  // Set optional variables
  console.log('🔧 Setting optional environment variables:\n');
  for (const varName of optionalVars) {
    if (envVars[varName]) {
      setVercelEnvVar(varName, envVars[varName]);
    } else {
      console.log(`ℹ️  Info: ${varName} not found in .env.local (optional)`);
    }
    console.log();
  }

  console.log('✅ Environment variable setup complete!');
  console.log('\n🚀 You can now deploy with: vercel --prod');
  console.log('📋 View your environment variables at: https://vercel.com/dashboard');
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});