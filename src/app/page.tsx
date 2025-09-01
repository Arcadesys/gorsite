"use client";

import Link from "next/link";
import PlaceholderArt from "@/components/PlaceholderArt";
import Hero from "@/components/Hero";
import { useTheme } from "@/context/ThemeContext";

export default function Home() {
  const { accentColor, colorMode } = useTheme();
  const palette = accentColor === 'green' ? 'emerald' : accentColor;
  const c400 = `var(--${palette}-400)`;
  const c600 = `var(--${palette}-600)`;
  const c700 = `var(--${palette}-700)`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section: image only */}
      <Hero />

      {/* Brand Intro moved below hero */}
      <section className="py-10 md:py-14"
        style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: c400 }}>
            DayAndNightProductions
          </h1>
          <p
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: colorMode === 'dark' ? '#e5e7eb' : '#374151' }}
          >
            Furry art and tattoo design from Day and Night Productions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/galleries"
              className="border font-bold py-3 px-8 rounded-full transition"
              style={{ borderColor: c600, color: c400 }}
            >
              View Portfolio
            </Link>
            <Link
              href="/commissions"
              className="text-white font-bold py-3 px-8 rounded-full transition"
              style={{ backgroundColor: c600 }}
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* About the Artist */}
      <section className="py-12 md:py-16" style={{ backgroundColor: colorMode === 'dark' ? '#0b0b0b' : '#f9fafb' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ color: c400 }}>About the Artist</h2>
            <p className={colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Artist-run studio. I am a 30+ mother. Graphic designer, retired tattoo artist and comic book creator, in the works. I have been creating artistic content of many different mediums for the better half of 18 years now, I do custom tattoo designs and character concept art. Including paintings for custom skateboard decks. I enjoy reading and spending time with my family in my down time. My kids are an important part of my life and influence my creative side and bring me the energy I need to get up and work in the morning. Building on my career as an artist to provide for my family is my driving goal.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f9fafb' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Featured Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg overflow-hidden shadow-lg transition" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
                <div className="relative h-64">
                  <PlaceholderArt width={400} height={256} className="w-full h-full" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: c400 }}>Artwork Title {item}</h3>
                  <p className={colorMode === 'dark' ? 'text-gray-400 mb-4' : 'text-gray-600 mb-4'}>Fantasy character illustration</p>
                  <Link href="/gallery" className="transition" style={{ color: c400 }}>
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/gallery" className="font-bold py-3 px-8 rounded-full transition border" style={{ color: c400, borderColor: c600 }}>
              View All Works
            </Link>
          </div>
        </div>
      </section>

      {/* Commission Info */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Commission Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg text-center" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: c400 }}>Character Sketches</h3>
              <p className={colorMode === 'dark' ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>Quick character sketches and concept art</p>
              <p className="text-3xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>$50+</p>
              <Link 
                href="/commissions" 
                className="text-white font-bold py-2 px-6 rounded-full transition block"
                style={{ backgroundColor: c600 }}
              >
                Order Now
              </Link>
            </div>
            <div className="p-8 rounded-lg text-center transform scale-105 border shadow-lg" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6', borderColor: c600, boxShadow: `0 10px 25px -10px ${colorMode === 'dark' ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)'}` }}>
              <div className="text-white py-1 px-4 rounded-full text-sm font-bold inline-block mb-4" style={{ backgroundColor: c600 }}>POPULAR</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: c400 }}>Full Character Art</h3>
              <p className={colorMode === 'dark' ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>Detailed character illustrations with background</p>
              <p className="text-3xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>$150+</p>
              <Link 
                href="/commissions" 
                className="text-white font-bold py-2 px-6 rounded-full transition block"
                style={{ backgroundColor: c600 }}
              >
                Order Now
              </Link>
            </div>
            <div className="p-8 rounded-lg text-center" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: c400 }}>Scene Illustrations</h3>
              <p className={colorMode === 'dark' ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>Complex scenes with multiple characters</p>
              <p className="text-3xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>$300+</p>
              <Link 
                href="/commissions" 
                className="text-white font-bold py-2 px-6 rounded-full transition block"
                style={{ backgroundColor: c600 }}
              >
                Order Now
              </Link>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/commissions" className="font-bold py-3 px-8 rounded-full transition border" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>
              View All Commission Options
            </Link>
          </div>
        </div>
      </section>

      {/* Social feed section removed intentionally */}

      {/* Contact CTA */}
      <section className="py-16" style={{ background: 'linear-gradient(90deg, #064e3b, #047857)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to bring your ideas to life?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#d1fae5' }}>
            Have you ever wanted to bring a character idea to life for a video game? Had a creature concept for a tabletop game? Or just wanted to see a piece of your imagination on screen? I can help! I&apos;m willing to work with barebones concepts and mesh with you to bring your ideas to life. From comic designs and fantastical creatures to skateboards and tattoos—anything under the sun, Day and Night. Reach out and let&apos;s make magic together!
          </p>
          <Link 
            href="/contact" 
            className="bg-white hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition"
            style={{ color: '#047857' }}
          >
            Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
}
