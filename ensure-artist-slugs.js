#!/usr/bin/env node

// Script to ensure all Artist users have portfolio slugs
// and provide superuser management capabilities

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

async function ensureArtistSlugs() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Finding all users and their portfolio status...\n');
    
    // Get all users with their portfolios
    const users = await prisma.user.findMany({
      include: {
        portfolios: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`Found ${users.length} total users:\n`);
    
    const artistsWithoutSlugs = [];
    const superadmins = [];
    const artistsWithSlugs = [];
    
    users.forEach(user => {
      const isArtist = user.role === 'USER'; // Artists have USER role
      const isSuperadmin = user.role === 'ADMIN'; // Superadmins have ADMIN role
      
      console.log(`📋 ${user.name || user.email} (${user.email})`);
      console.log(`   Role: ${user.role} ${isArtist ? '(Artist)' : isSuperadmin ? '(Superadmin)' : ''}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Portfolios: ${user.portfolios.length}`);
      
      if (user.portfolios.length > 0) {
        user.portfolios.forEach(p => {
          console.log(`     - "${p.displayName}" (slug: ${p.slug})`);
        });
      }
      
      if (isArtist && user.portfolios.length === 0) {
        artistsWithoutSlugs.push(user);
        console.log(`   ⚠️  MISSING PORTFOLIO - Will create one`);
      } else if (isArtist && user.portfolios.length > 0) {
        artistsWithSlugs.push(user);
        console.log(`   ✅ Has portfolio`);
      } else if (isSuperadmin) {
        superadmins.push(user);
        if (user.portfolios.length > 0) {
          console.log(`   ⚠️  SUPERADMIN HAS PORTFOLIO - Should not have one`);
        } else {
          console.log(`   ✅ Correctly has no portfolio`);
        }
      }
      
      console.log('');
    });
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Artists with portfolios: ${artistsWithSlugs.length}`);
    console.log(`   Artists without portfolios: ${artistsWithoutSlugs.length}`);
    console.log(`   Superadmins: ${superadmins.length}`);
    console.log('');
    
    // Create portfolios for artists without them
    if (artistsWithoutSlugs.length > 0) {
      console.log('🔧 Creating portfolios for artists without them...\n');
      
      for (const user of artistsWithoutSlugs) {
        const baseSlug = baseFromEmail(user.email);
        const slug = await generateUniqueSlug(baseSlug, prisma);
        const displayName = user.name || baseFromEmail(user.email) || 'Artist';
        
        console.log(`Creating portfolio for ${user.email}:`);
        console.log(`   Display Name: ${displayName}`);
        console.log(`   Slug: ${slug}`);
        
        const portfolio = await prisma.portfolio.create({
          data: {
            slug,
            displayName,
            description: `Welcome to ${displayName}'s art gallery!`,
            userId: user.id,
            isPublic: true
          }
        });
        
        console.log(`   ✅ Created portfolio with ID: ${portfolio.id}\n`);
      }
    }
    
    // Check for test portfolios that can be deleted
    console.log('🧹 Checking for test portfolios...\n');
    
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
      console.log('Found test portfolios:');
      testPortfolios.forEach((portfolio, i) => {
        console.log(`${i + 1}. "${portfolio.displayName}" (${portfolio.slug})`);
        console.log(`   Owner: ${portfolio.user.name || portfolio.user.email}`);
        console.log(`   ID: ${portfolio.id}`);
        console.log('');
      });
      
      console.log('💡 To delete a test portfolio as superuser, run:');
      console.log('   node ensure-artist-slugs.js delete <portfolio-id>');
    } else {
      console.log('No test portfolios found.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
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
      console.log('Usage: node ensure-artist-slugs.js delete <portfolio-id>');
      return;
    }
    await deletePortfolio(args[1]);
  } else {
    await ensureArtistSlugs();
  }
}

if (require.main === module) {
  main();
}