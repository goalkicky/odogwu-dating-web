'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCATION_TEMPLATE_CSS } from '@/lib/locationTemplateStyles';

const CITIES = [
  { img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=200&q=80', name: 'Bangkok', location: 'Bangkok, Thailand', distance: '0 km' },
  { img: 'https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?auto=format&fit=crop&w=200&q=80', name: 'Chiang Mai', location: 'Chiang Mai, Thailand', distance: '693 km' },
  { img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=200&q=80', name: 'Phuket', location: 'Phuket, Thailand', distance: '863 km' },
  { img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=200&q=80', name: 'Pattaya', location: 'Chonburi, Thailand', distance: '1051 km' },
  { img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=200&q=80', name: 'Krabi', location: 'Krabi, Thailand', distance: '1121 km' },
  { img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=200&q=80', name: 'Hatyai', location: 'Songkhla, Thailand', distance: '1187 km' },
];

export default function ChangeLocationPage() {
  const router = useRouter();
  const [query, setQuery] = useState('Thailand');
  const [buttonText, setButtonText] = useState('Set location to Thailand');
  const [toast, setToast] = useState('');
  const toastTimer = React.useRef<any>(null);

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1500);
  };

  const handleUseCurrent = () => {
    if (!navigator.geolocation) {
      showToast('Location detection is not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => showToast('Current location detected.'),
      () => showToast('Unable to detect your location. Please check your location permission.')
    );
  };

  const handleSetLocation = () => {
    setButtonText('Location set ✓');
    setTimeout(() => setButtonText('Set location to Thailand'), 1800);
  };

  const visibleCities = CITIES.filter((city) =>
    !query.trim() ||
    city.name.toLowerCase().includes(query.trim().toLowerCase()) ||
    city.location.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="ln">
      <style jsx global>{LOCATION_TEMPLATE_CSS}</style>

      <div className="ln app">
        <header className="ln app-header">
          <button className="ln back-arrow" aria-label="Go back" onClick={() => router.back()} />
          <div className="ln logo">
            <div className="ln logo-main">dogwu<span className="ln logo-heart">♥</span></div>
            <div className="ln logo-sub">DATING</div>
          </div>
          <button className="ln chat-icon" aria-label="Messages" onClick={() => router.push('/matches')}>
            <span className="ln chat-dots">•••</span><span className="ln notification">3</span>
          </button>
        </header>

        <section className="ln location-sheet">
          <div className="ln sheet-header">
            <button className="ln close-button" id="closeButton" aria-label="Close" onClick={() => router.back()} />
            <h1 className="ln sheet-title">Change location</h1>
          </div>

          <div className="ln search-container">
            <div className="ln search-box">
              <div className="ln search-icon"></div>
              <input
                className="ln search-input"
                type="text"
                value={query}
                placeholder="Search country or city"
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="ln clear-button" aria-label="Clear search" onClick={() => setQuery('')}>×</button>
            </div>
          </div>

          <div className="ln selected-country">
            <div className="ln pin-icon"></div>
            <div className="ln country-text">
              <div className="ln country-name">Thailand</div>
              <div className="ln country-type">Country</div>
            </div>
            <div className="ln check"></div>
          </div>

          <div className="ln content-scroll">
            <div className="ln city-heading">Popular cities in Thailand</div>
            <div className="ln city-list">
              {visibleCities.map((city) => (
                <div className="ln city-item" key={city.name}>
                  <img className="ln city-image" src={city.img} alt={city.name} />
                  <div className="ln city-info"><div className="ln city-name">{city.name}</div><div className="ln city-location">{city.location}</div></div>
                  <div className="ln city-distance">{city.distance}</div>
                </div>
              ))}
            </div>

            <button className="ln current-location" onClick={handleUseCurrent}>
              <div className="ln current-icon"><div className="ln current-pin"></div></div>
              <div className="ln current-text">
                <div className="ln current-title">Use current location</div>
                <div className="ln current-subtitle">Detect my location automatically</div>
              </div>
              <div className="ln chevron"></div>
            </button>

            <div className="ln info-card">
              <div className="ln world-icon"></div>
              <div className="ln info-text">
                <div className="ln info-title">Travel the world, meet amazing people 💕</div>
                <div className="ln info-description">Changing your location allows you to discover and connect with singles in that area.</div>
              </div>
            </div>
          </div>

          <div className="ln bottom-action">
            <button className="ln location-button" onClick={handleSetLocation}>{buttonText}</button>
          </div>
        </section>
      </div>

      <div className={`ln toast${toast ? ' show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}