'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FaEnvelope, FaCheck } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const { accentColor, colorMode } = useTheme();
  const palette = accentColor === 'green' ? 'emerald' : accentColor;
  const c400 = `var(--${palette}-400)`;
  const c600 = `var(--${palette}-600)`;
  const c700 = `var(--${palette}-700)`;
  
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 1500);
  };
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate subscription
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setSubscribeEmail('');
    }, 1500);
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
            Get in <span style={{ color: c400 }}>Touch</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            You can reach out at <span className="font-semibold" style={{ color: '#d1fae5' }}>DayAndNightProductions2002@gmail.com</span> for specific custom creations and collaboration.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="p-8 rounded-lg" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
                <h3 className="text-2xl font-bold mb-6" style={{ color: c400 }}>Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <FaEnvelope className="text-xl mt-1 flex-shrink-0" style={{ color: c400 }} />
                    <div>
                      <h4 className="font-bold mb-1" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>Email</h4>
                      <p className="text-gray-400">Don&apos;t hesitate to reach out!</p>
                      <a href="mailto:DayAndNightProductions2002@gmail.com" className="transition" style={{ color: c400 }}>
                        DayAndNightProductions2002@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white mb-1">Commission Status</h4>
                    <p className="text-green-400">Open and available</p>
                    <p className="text-gray-400 text-sm mt-1">Queue updated bi-weekly.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white mb-1">Business Hours</h4>
                    <p className="text-gray-400">Most weekdays between 10 and 10.</p>
                    <p className="text-gray-400">Unavailable on Thursdays and Sundays.</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="p-8 rounded-lg" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff', border: `1px solid ${c700}` }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: c400 }}>Send a Message</h2>
                
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: c600 }}>
                      <FaCheck className="text-white text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-400 mb-6">
                      Thank you for reaching out. I&apos;ll get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-white font-bold py-2 px-6 rounded-full transition"
                      style={{ backgroundColor: c600 }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-white mb-2">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-white mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none"
                        placeholder="Your email"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-white mb-2">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none"
                        required
                      >
                        <option value="" disabled>Select a subject</option>
                        <option value="commission">Commission Inquiry</option>
                        <option value="collaboration">Collaboration Proposal</option>
                        <option value="question">General Question</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-white mb-2">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none"
                        placeholder="Your message"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="text-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="text-white font-bold py-3 px-8 rounded-full transition flex items-center justify-center mx-auto"
                        style={{ backgroundColor: c600 }}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Stay Updated */}
              <div className="p-8 rounded-lg" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff', border: `1px solid ${c700}` }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: c400 }}>Stay Updated</h2>
                
                {isSubscribed ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: c600 }}>
                      <FaCheck className="text-white text-xl" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Subscribed!</h3>
                    <p className="text-gray-400">
                      Thank you for subscribing to my newsletter.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300 mb-6">
                      Subscribe to my newsletter to receive updates on new artwork, commission availability, and special offers.
                    </p>
                    
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="flex">
                        <input
                          type="email"
                          value={subscribeEmail}
                          onChange={(e) => setSubscribeEmail(e.target.value)}
                        className="flex-grow bg-gray-900 border border-gray-700 rounded-l-lg px-4 py-3 text-white focus:outline-none"
                          placeholder="Your email address"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="text-white font-bold px-4 rounded-r-lg transition flex items-center justify-center"
                          style={{ backgroundColor: c600 }}
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <FaEnvelope />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs">
                        By subscribing, you agree to receive emails from me. You can unsubscribe at any time.
                      </p>
                    </form>
                  </>
                )}
              </div>
              
              {/* FAQ */}
              <div className="p-8 rounded-lg" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff', border: `1px solid ${c700}` }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: c400 }}>FAQ</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-bold mb-1">How long does a commission take?</h3>
                    <p className="text-gray-400">
                      Depending on the complexity, commissions typically take 1-3 weeks to complete.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold mb-1">Do you ship physical prints?</h3>
                    <p className="text-gray-400">
                      Yes, I offer high-quality prints of my artwork that can be shipped worldwide.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold mb-1">Can I use commissioned art commercially?</h3>
                    <p className="text-gray-400">
                      Commercial usage rights are available for an additional fee. Please specify your needs when requesting a commission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 
