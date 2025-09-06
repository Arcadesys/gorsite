// Quick debug function to add to browser console
// Paste this into your browser console on the portfolio page

window.debugPortfolio = async function() {
  console.log('🔍 Portfolio Debug Info');
  console.log('========================');
  
  try {
    // Fetch current portfolio data
    const response = await fetch('/api/studio/portfolio');
    if (response.ok) {
      const data = await response.json();
      const portfolio = data.portfolio;
      
      console.log('📊 Portfolio Data:');
      console.log('- ID:', portfolio.id);
      console.log('- Slug:', portfolio.slug);
      console.log('- Display Name:', portfolio.displayName);
      console.log('- Profile Image URL:', portfolio.profileImageUrl || 'NOT SET');
      console.log('- Banner Image URL:', portfolio.bannerImageUrl || 'NOT SET');
      console.log('- Hero Image Light:', portfolio.heroImageLight || 'NOT SET');
      console.log('- Hero Image Dark:', portfolio.heroImageDark || 'NOT SET');
      console.log('- Hero Image Mobile:', portfolio.heroImageMobile || 'NOT SET');
      console.log('- Is Public:', portfolio.isPublic);
      
      console.log('\n🔗 Banner Sync Status:');
      const bannerSynced = portfolio.bannerImageUrl && 
                          portfolio.bannerImageUrl === portfolio.heroImageLight &&
                          portfolio.bannerImageUrl === portfolio.heroImageDark &&
                          portfolio.bannerImageUrl === portfolio.heroImageMobile;
      console.log('- Banner → Hero sync:', bannerSynced ? '✅ SYNCED' : '❌ NOT SYNCED');
      
      console.log('\n📄 Public Page URL:');
      if (portfolio.slug && portfolio.isPublic) {
        const publicUrl = `${window.location.origin}/${portfolio.slug}`;
        console.log(`- ${publicUrl}`);
        console.log('- Click to test banner display:', publicUrl);
      } else {
        console.log('- Portfolio not public or no slug set');
      }
      
      return portfolio;
    } else {
      console.error('Failed to fetch portfolio:', response.status);
    }
  } catch (error) {
    console.error('Debug failed:', error);
  }
};

console.log('💡 Debug function loaded! Run: debugPortfolio()');