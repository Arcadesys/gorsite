#!/usr/bin/env node

// Script to sync all Supabase users to local database and ensure Artists have portfolios

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

function baseFromEmail(email) {
  if (!email) return 'artist';
  const base = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'artist';
}

function isReservedSlug(slug) {
  const reserved = [
    'api', 'admin', 'dashboard', 'studio', 'auth', 'login', 'signup',
    'gallery', 'galleries', 'commission', 'commissions', 'about', 'contact',
    'terms', 'privacy', 'help', 'support', 'blog', 'news', 'home', 'index',
    'public', 'static', 'assets', 'images', 'uploads', 'files', 'docs',
    'superadmin', 'superuser', 'root', 'system', 'config', 'settings'
  ];
  return reserved.includes(slug.toLowerCase());
}

async function generateUniqueSlug(baseSlug, prisma, excludePortfolioId = null) {
  let slug = baseSlug;
  let counter = 1;
  
  while (isReservedSlug(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }
  
  // Check database for conflicts
  while (true) {
    const existing = await prisma.portfolio.findUnique({ 
      where: { slug },
      select: { id: true }
    });
    
    if (!existing || existing.id === excludePortfolioId) {
      break;
    }
    
    slug = `${baseSlug}-${counter++}`;
  }
  
  return slug;
}

async function syncUsersAndEnsureSlugs() {
  const prisma = new PrismaClient();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    return;
  }
  
  const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  try {
    console.log('🔄 Fetching all users from Supabase...\n');
    
    // Fetch all users from Supabase auth
    const { data: supabaseUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Failed to fetch Supabase users:', error.message);
      return;
    }
    
    console.log(`Found ${supabaseUsers.users.length} users in Supabase:\n`);
    
    const superEmail = (process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me').toLowerCase();
    const newUsers = [];
    
    // Sync each Supabase user to local database
    for (const supabaseUser of supabaseUsers.users) {
      const isSuper = String(supabaseUser.email || '').toLowerCase() === superEmail;
      
      console.log(`👤 ${supabaseUser.email} (${isSuper ? 'Superadmin' : 'Artist'})`);
      
      // Check if user exists locally
      let localUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
        include: { portfolios: true }
      });
      
      const userData = {
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.user_metadata?.name || 
              supabaseUser.email?.split('@')[0] || 
              'Artist',
        role: isSuper ? 'ADMIN' : 'USER'
      };
      
      if (!localUser) {
        console.log('   📝 Creating local user record...');
        localUser = await prisma.user.create({
          data: {
            id: supabaseUser.id,
            ...userData
          },
          include: { portfolios: true }
        });
        newUsers.push(localUser);
      } else {
        console.log('   ✅ Local user exists');
        // Update user data if needed
        if (localUser.email !== userData.email || 
            localUser.name !== userData.name || 
            localUser.role !== userData.role) {
          console.log('   🔄 Updating user data...');
          localUser = await prisma.user.update({
            where: { id: supabaseUser.id },
            data: userData,
            include: { portfolios: true }
          });
        }
      }
      
      // Check portfolio status
      if (isSuper) {
        if (localUser.portfolios.length > 0) {
          console.log(`   ⚠️  SUPERADMIN HAS ${localUser.portfolios.length} PORTFOLIO(S) - Should not have any`);
        } else {
          console.log('   ✅ Correctly has no portfolio');
        }
      } else {
        // Artist - should have a portfolio
        if (localUser.portfolios.length === 0) {
          console.log('   🔧 Creating portfolio...');
          
          const baseSlug = baseFromEmail(localUser.email);
          const slug = await generateUniqueSlug(baseSlug, prisma);
          const displayName = localUser.name || baseFromEmail(localUser.email) || 'Artist';
          
          const portfolio = await prisma.portfolio.create({
            data: {
              slug,
              displayName,
              description: `Welcome to ${displayName}'s art gallery!`,
              userId: localUser.id,
              isPublic: true
            }
          });
          
          console.log(`   ✅ Created portfolio: "${displayName}" (${slug})`);
        } else {
          console.log(`   ✅ Has ${localUser.portfolios.length} portfolio(s):`);
          localUser.portfolios.forEach(p => {
            console.log(`      - "${p.displayName}" (${p.slug})`);
          });
        }
      }
      
      console.log('');
    }
    
    // Final summary
    console.log('📊 SYNC COMPLETE!\n');
    
    const allUsers = await prisma.user.findMany({
      include: { portfolios: true }
    });
    
    const artists = allUsers.filter(u => u.role === 'USER');
    const superadmins = allUsers.filter(u => u.role === 'ADMIN');
    const artistsWithPortfolios = artists.filter(u => u.portfolios.length > 0);
    const artistsWithoutPortfolios = artists.filter(u => u.portfolios.length === 0);
    
    console.log('Final Status:');
    console.log(`   👨‍🎨 Artists: ${artists.length}`);
    console.log(`   ✅ Artists with portfolios: ${artistsWithPortfolios.length}`);
    console.log(`   ❌ Artists without portfolios: ${artistsWithoutPortfolios.length}`);
    console.log(`   👑 Superadmins: ${superadmins.length}`);
    console.log(`   📝 New users synced: ${newUsers.length}`);
    
    if (artistsWithoutPortfolios.length > 0) {
      console.log('\n⚠️  Some artists still missing portfolios:');
      artistsWithoutPortfolios.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    } else {
      console.log('\n🎉 All artists have portfolios!');
    }
    
    // Show test portfolios for cleanup
    const testPortfolios = await prisma.portfolio.findMany({
      where: {
        OR: [
          { slug: { contains: 'test' } },
          { displayName: { contains: 'Test' } },
          { displayName: { contains: 'test' } }
        ]
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    if (testPortfolios.length > 0) {
      console.log('\n🧹 Test portfolios available for cleanup:');
      testPortfolios.forEach((portfolio, i) => {
        console.log(`${i + 1}. "${portfolio.displayName}" (${portfolio.slug})`);
        console.log(`   Owner: ${portfolio.user.name || portfolio.user.email}`);
        console.log(`   ID: ${portfolio.id}`);
        console.log('');
      });
      
      console.log('💡 To delete a test portfolio as superuser, run:');
      console.log('   node sync-users-and-slugs.js delete <portfolio-id>');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

async function deletePortfolio(portfolioId) {
  const prisma = new PrismaClient();
  
  try {
    console.log(`🗑️  Attempting to delete portfolio with ID: ${portfolioId}\n`);
    
    // First, get portfolio details
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        user: {
          select: { email: true, name: true, role: true }
        },
        prices: true,
        links: true,
        artistWorks: true
      }
    });
    
    if (!portfolio) {
      console.log('❌ Portfolio not found');
      return;
    }
    
    console.log('Portfolio details:');
    console.log(`   Name: "${portfolio.displayName}"`);
    console.log(`   Slug: ${portfolio.slug}`);
    console.log(`   Owner: ${portfolio.user.name || portfolio.user.email} (${portfolio.user.role})`);
    console.log(`   Commission prices: ${portfolio.prices.length}`);
    console.log(`   Links: ${portfolio.links.length}`);
    console.log(`   Artworks: ${portfolio.artistWorks.length}`);
    console.log('');
    
    // Delete the portfolio (cascade will handle related data)
    await prisma.portfolio.delete({
      where: { id: portfolioId }
    });
    
    console.log('✅ Portfolio deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting portfolio:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === 'delete') {
    if (args.length < 2) {
      console.log('❌ Please provide a portfolio ID to delete');
      console.log('Usage: node sync-users-and-slugs.js delete <portfolio-id>');
      return;
    }
    await deletePortfolio(args[1]);
  } else {
    await syncUsersAndEnsureSlugs();
  }
}

if (require.main === module) {
  main();
}