#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Complete deployment script for Vercel
 * This will:
 * 1. Check if you're logged into Vercel
 * 2. Link the project if needed
 * 3. Set up environment variables
 * 4. Deploy to production
 */

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function checkCommand(command, description) {
  try {
    execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log(`❌ ${description}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting automated Vercel deployment...\n');

  // Check if Vercel CLI is installed
  if (!checkCommand('vercel --version', 'Vercel CLI not found')) {
    console.log('Installing Vercel CLI...');
    runCommand('npm install -g vercel', 'Installing Vercel CLI');
  }

  // Check if user is logged in
  if (!checkCommand('vercel whoami', 'Not logged into Vercel')) {
    console.log('Please log in to Vercel:');
    runCommand('vercel login', 'Logging into Vercel');
  }

  // Check if project is linked
  if (!checkCommand('vercel project ls --limit 1', 'Project not linked')) {
    console.log('Linking project to Vercel...');
    runCommand('vercel --confirm', 'Linking project');
  }

  // Set up environment variables
  console.log('🔧 Setting up environment variables...');
  runCommand('node scripts/setup-vercel-env.js', 'Environment variable setup');

  // Deploy to production
  console.log('🚀 Deploying to production...');
  runCommand('vercel --prod', 'Production deployment');

  console.log('🎉 Deployment complete!');
  console.log('📋 Check your deployment at: https://vercel.com/dashboard');
}

main().catch(error => {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n🔧 You can try running individual steps:');
  console.log('  1. vercel login');
  console.log('  2. vercel --confirm');
  console.log('  3. npm run setup:vercel');
  console.log('  4. vercel --prod');
  process.exit(1);
});