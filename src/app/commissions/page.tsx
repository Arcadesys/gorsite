'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const CommissionsPage = () => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { accentColor, colorMode } = useTheme();
  const palette = accentColor === 'green' ? 'emerald' : accentColor;
  const c400 = `var(--${palette}-400)`;
  const c500 = `var(--${palette}-500)`;
  const c600 = `var(--${palette}-600)`;
  const c700 = `var(--${palette}-700)`;
  
  const commissionTiers = [
    {
      id: 'sketch',
      name: 'Character Sketch',
      price: '$50+',
      description: 'Simple character sketches and concept art',
      deliverables: 'High-resolution sketch file',
      turnaround: '3-5 days',
      revisions: '1 revision',
      features: [
        'Single character',
        'Sketch/lineart only',
        'Simple/no background',
        'Commercial use not included',
      ],
    },
    {
      id: 'character',
      name: 'Full Character Art',
      price: '$150+',
      description: 'Detailed character illustrations with background',
      deliverables: 'High-resolution PNG and PSD files',
      turnaround: '7-10 days',
      revisions: '2 revisions',
      features: [
        'Single character',
        'Full color and shading',
        'Simple background included',
        'Commercial use available (+50%)',
      ],
      popular: true,
    },
    {
      id: 'scene',
      name: 'Scene Illustration',
      price: '$300+',
      description: 'Complex scenes with multiple characters',
      deliverables: 'High-resolution PNG and PSD files',
      turnaround: '14-21 days',
      revisions: '3 revisions',
      features: [
        'Up to 3 characters',
        'Full color and detailed shading',
        'Complex background',
        'Commercial use available (+50%)',
      ],
    },
  ];

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-20"
        style={{ background: `linear-gradient(to bottom, var(--${palette}-900), ${colorMode === 'dark' ? '#000' : '#fff'})` }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>
            Commission <span style={{ color: c400 }}>Information</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            I offer various types of digital art commissions to bring your ideas to life
          </p>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Commission Tiers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {commissionTiers.map((tier) => (
              <div 
                key={tier.id}
                className={`bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${
                  tier.popular ? 'transform md:scale-105' : ''
                }`}
                style={{
                  borderWidth: tier.popular ? 2 : 1,
                  borderStyle: 'solid',
                  borderColor: tier.popular ? c500 : (colorMode === 'dark' ? '#1f2937' : '#e5e7eb'),
                  outline: selectedTier === tier.id ? `2px solid ${c400}` : undefined,
                  boxShadow: tier.popular ? `0 10px 25px -10px ${colorMode === 'dark' ? 'rgba(16,185,129,0.35)' : 'rgba(0,0,0,0.08)'}` : undefined,
                }}
              >
                {tier.popular && (
                  <div className="text-white py-1 px-4 text-sm font-bold text-center" style={{ backgroundColor: c600 }}>
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: c400 }}>{tier.name}</h3>
                  <p className="text-gray-400 mb-4">{tier.description}</p>
                  <p className="text-3xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>{tier.price}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400">Deliverables:</span>
                      <span className="text-white">{tier.deliverables}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400">Turnaround:</span>
                      <span className="text-white">{tier.turnaround}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-400">Revisions:</span>
                      <span className="text-white">{tier.revisions}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: c500 }}>
                      What&apos;s included:
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => handleSelectTier(tier.id)}
                    className="w-full py-3 px-6 rounded-full font-bold transition"
                    style={{
                      backgroundColor: selectedTier === tier.id ? c600 : 'transparent',
                      color: selectedTier === tier.id ? '#fff' : c400 as unknown as string,
                      border: selectedTier === tier.id ? 'none' : `1px solid ${c600}`,
                    }}
                  >
                    {selectedTier === tier.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Form */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-lg p-8" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff', border: `1px solid ${c700}` }}>
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: c400 }}>Request a Commission</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-white mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="commissionType" className="block text-white mb-2">Commission Type</label>
                <select
                  id="commissionType"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={selectedTier || ''}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a commission type</option>
                  {commissionTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} ({tier.price})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-white mb-2">Project Description</label>
                <textarea
                  id="description"
                  rows={5}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your commission request in detail..."
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="references" className="block text-white mb-2">Reference Images (optional)</label>
                <input
                  type="file"
                  id="references"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  multiple
                />
                <p className="text-gray-500 text-sm mt-1">You can upload multiple reference images (max 5MB each)</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="mr-2 h-5 w-5 rounded"
                  style={{ accentColor: c600 as unknown as string, borderColor: colorMode === 'dark' ? '#374151' : '#d1d5db' }}
                  required
                />
                <label htmlFor="terms" className="text-gray-300">
                  I agree to the <Link href="/terms" className="transition" style={{ color: c400 }}>terms and conditions</Link>
                </label>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="text-white font-bold py-3 px-8 rounded-full transition"
                  style={{ backgroundColor: c600 }}
                >
                  Submit Commission Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Commission Process */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Commission Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: 'Request',
                description: 'Fill out the commission form with your project details',
              },
              {
                step: 2,
                title: 'Approval',
                description: 'I&apos;ll review your request and contact you with a quote and timeline',
              },
              {
                step: 3,
                title: 'Creation',
                description: 'Once payment is received, I&apos;ll begin working on your commission',
              },
              {
                step: 4,
                title: 'Delivery',
                description: 'You&apos;ll receive the final artwork in the requested format',
              },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-lg text-center relative" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f9fafb' }}>
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: c600 }}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mt-4 mb-3" style={{ color: c400 }}>{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: 'How do I pay for my commission?',
                answer: 'I accept payments through PayPal, Stripe, and bank transfers. A 50% non-refundable deposit is required to start work, with the remaining 50% due upon completion.',
              },
              {
                question: 'What if I need revisions?',
                answer: 'Each commission tier includes a specific number of revision rounds. Additional revisions may be available for an extra fee.',
              },
              {
                question: 'Do you offer commercial usage rights?',
                answer: 'Yes, commercial usage rights are available for an additional 50% of the base commission price. Please specify your commercial needs when requesting a commission.',
              },
              {
                question: 'What is your refund policy?',
                answer: 'The initial 50% deposit is non-refundable as it covers the initial work. If you&apos;re not satisfied with the final result, I&apos;ll work with you to address your concerns within the included revision rounds.',
              },
              {
                question: 'How long will my commission take?',
                answer: 'Depending on the complexity of the piece and the size and medium, turnaround is typically 1–3 weeks. Some pieces may take longer if they require more complex work and details. I\'ll work with you on this and offer payment plans as we go for pieces that may take longer.',
              },
              {
                question: 'Do you offer prints or merch?',
                answer: 'Yes! I offer high-quality prints as well as stickers, t-shirts, posters, playmats, and skateboards. Shipping and handling fees will be listed with each piece along with estimated arrival times. I ship worldwide. A Redbubble store is being set up and will be linked once live.',
              },
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-lg" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff', border: `1px solid ${colorMode === 'dark' ? '#1f2937' : '#e5e7eb'}` }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: c400 }}>{item.question}</h3>
                <p className="text-gray-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommissionsPage; 
