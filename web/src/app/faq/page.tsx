'use client';
import React, { useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { HelpIcon, ChevronForwardIcon } from '@/components/Icons';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I create an account?', a: 'Download the Odogwu app from the App Store or Google Play Store, or sign up on our website. You\'ll need to provide your basic info, upload at least 3 photos, and verify your phone number and email to get started.' },
      { q: 'Is Odogwu free to use?', a: 'Yes! Odogwu is free to create an account, browse profiles, and send up to 10 likes per day. Premium features like unlimited likes, Super Likes, and profile boosts are available through our Premium and Platinum subscription plans.' },
      { q: 'How do I verify my profile?', a: 'After signing up, you\'ll be prompted to verify your profile. This includes phone number verification, email verification, and a photo verification process where you\'ll take a selfie that our AI compares to your profile photos.' },
    ],
  },
  {
    category: 'Matching & Profiles',
    items: [
      { q: 'How does the matching algorithm work?', a: 'Our AI-powered algorithm analyzes your preferences, swiping behavior, profile information, and interactions to suggest the most compatible matches. The more you use the app, the smarter your matches become.' },
      { q: 'Can I change my location?', a: 'Free users can match with people in their current location. Premium users can use the Passport feature to match in any city or country worldwide. Platinum users have unlimited location changes.' },
      { q: 'What are Super Likes?', a: 'Super Likes are a way to show someone you\'re really interested. When you Super Like someone, they\'ll see a special indicator that you liked them. Free users get 1 Super Like per week, Premium gets 5, and Platinum gets unlimited.' },
      { q: 'How do I get more matches?', a: 'Complete your profile with great photos, write an engaging bio, use Boosts for increased visibility, and be active on the platform. Premium subscribers typically get 3x more matches than free users.' },
    ],
  },
  {
    category: 'Safety & Privacy',
    items: [
      { q: 'Is my data safe on Odogwu?', a: 'Absolutely. We use industry-standard encryption to protect your data. Your personal information is never shared with third parties without your consent. We also offer photo privacy controls so you can control who sees your pictures.' },
      { q: 'How do I report someone?', a: 'You can report any user directly from their profile or chat screen. Our moderation team reviews every report within 24 hours. We have a zero-tolerance policy for harassment, hate speech, and inappropriate behavior.' },
      { q: 'Can I block someone?', a: 'Yes, you can block any user at any time. Blocked users won\'t be able to see your profile or contact you. You can also unblock users from your settings at any time.' },
      { q: 'Are all profiles verified?', a: 'Every profile on Odogwu goes through our verification process. Profiles that complete all verification steps receive a blue verification badge. We actively monitor for suspicious activity and remove unverified or fake accounts.' },
    ],
  },
  {
    category: 'Subscription & Billing',
    items: [
      { q: 'How do I upgrade my subscription?', a: 'You can upgrade directly from the Premium section in the app or on our website. Choose between our Premium and Platinum plans, and select monthly or annual billing. Annual plans save you 20%.' },
      { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime from your account settings. Your premium features will remain active until the end of your current billing period. We won\'t charge you for the next period.' },
      { q: 'Is there a refund policy?', a: 'We offer a 7-day money-back guarantee for all new subscriptions. If you\'re not satisfied, contact our support team within 7 days of purchase for a full refund.' },
    ],
  },
  {
    category: 'Technical Support',
    items: [
      { q: 'The app isn\'t working properly, what should I do?', a: 'First, try force-closing the app and restarting it. If that doesn\'t work, try clearing your cache or reinstalling the app. If issues persist, contact our support team at support@odogwu.com.' },
      { q: 'How do I delete my account?', a: 'You can delete your account permanently from the Settings menu. This will remove all your data, matches, and conversations. Account deletion is irreversible, so please consider this carefully.' },
    ],
  },
];

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: isOpen ? '1px solid rgba(255,55,95,0.2)' : '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            transition: 'border-color 0.3s',
          }}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{
                width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                textAlign: 'left',
              }}
            >
              <span>{item.q}</span>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: isOpen ? 'rgba(255,55,95,0.15)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginLeft: 12,
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s, background 0.3s',
              }}>
                <ChevronForwardIcon size={16} color={isOpen ? '#FF375F' : '#6B6B6B'} />
              </div>
            </button>
            <div style={{
              maxHeight: isOpen ? 300 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}>
              <div style={{ padding: '0 24px 20px', color: '#ABABAB', fontSize: 15, lineHeight: '24px' }}>
                {item.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div style={{ background: '#0D0D0D', color: 'white' }}>
      <MarketingNav />

      <section style={{ padding: '140px 24px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 9999, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', marginBottom: 24, fontSize: 13, color: '#6C63FF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            <HelpIcon size={16} color="#6C63FF" /> FAQ
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, margin: '0 0 16px' }}>
            Frequently Asked <span style={{ background: 'linear-gradient(135deg, #FF375F, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Questions</span>
          </h1>
          <p style={{ color: '#ABABAB', fontSize: 18 }}>Everything you need to know about Odogwu.</p>
        </div>

        {faqs.map((group, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FF375F', marginBottom: 16 }}>{group.category}</h2>
            <Accordion items={group.items} />
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: 64, padding: '48px 32px', borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Still have questions?</h3>
          <p style={{ color: '#ABABAB', fontSize: 15, marginBottom: 24 }}>We&apos;re here to help. Reach out to our support team.</p>
          <a href="mailto:support@odogwu.com" style={{
            padding: '14px 32px', borderRadius: 9999, fontSize: 15, fontWeight: 600,
            background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
            color: 'white', textDecoration: 'none', display: 'inline-block',
          }}>Contact Support</a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
