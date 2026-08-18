import { SiteContent } from '../types';

export const INITIAL_SITE_CONTENT: SiteContent = {
  hero: {
    title: '28 States in 28 Weeks. One Living Mosaic of India.',
    subtitle: 'A solo backpacking journey across every state of India by foot, bus, train, and hitchhikes—chronicling 1,000 real souls into a published book and interactive digital monument.',
    highlightText: 'ONE JOURNEY → 28 STATES → 1000 PEOPLE → ONE LIVING MAP OF INDIA',
    authorName: 'Channveer Shankad (Veer)',
    authorTitle: 'Travel Writer & Backpacking Explorer',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
    ctaPrimary: 'Explore Living Mosaic',
    ctaSecondary: 'Pre-order Book — ₹499'
  },
  journeyStats: {
    totalStates: 28,
    totalWeeks: 28,
    totalDistanceKm: 2800,
    totalSupportersTarget: 1000,
    currentSupportersCount: 842,
    storiesCollected: 1420
  },
  book: {
    title: 'India – 28 States in 28 Weeks',
    subtitle: 'Footprints, Flavours, and the Forgotten Kindnesses of 1,000 Strangers',
    author: 'Channveer Shankad (Veer)',
    price: 499,
    originalPrice: 799,
    currency: '₹',
    coverImage: '/assets/book_front.jpg',
    description: 'An unfiltered, heartfelt memoir of a solo overland expedition across all 28 states of India. Filled with raw journal excerpts, encounters with remote tribes, highway dhabas at 3 AM, and the philosophy of wandering without fear.',
    pageCount: 348,
    highlights: [
      'Raw, unvarnished field notes from all 28 Indian states',
      'Exclusive full-color photo plates & hand-drawn route maps',
      'All 1,000 featured supporters immortalized in the printed edition appendix',
      'Signed author dedication card & custom 2Shoes2Faar luggage tag bookmark'
    ],
    sampleQuotes: [
      '"You don’t cross India by measuring kilometers; you cross it by measuring the kindness of tea vendors and truck drivers."',
      '"When your soles wear thin, your perception grows immensely deep."'
    ],
    deliveryInfo: 'Free shipping all across India via Speed Post. International courier dispatch available on request.'
  },
  about: {
    headline: 'Behind the Brand: 2Shoes2Faar',
    bioParagraph1: 'My name is Channveer Shankad, but on the road, friends and strangers simply call me Veer. I set out with a simple pair of shoes, a single backpack, and one audacity: to touch all 28 states of my motherland consecutively in 28 weeks.',
    bioParagraph2: 'What started as a personal quest quickly turned into something far bigger than me. In every state—from the snow-locked passes of Ladakh to the living root bridges of Meghalaya and the silent salt flats of Kutch—I met extraordinary people who fed me, sheltered me, and shared their life philosophies.',
    bioParagraph3: '2Shoes2Faar was born from the belief that two shoes can take you farther than you ever imagined if you step forward with humility and open arms. This book and this living mosaic are dedicated to the 1,000 souls who made this dream a reality.',
    philosophy: 'Travel is not consumption; it is communion. When you travel slowly and solo, fear turns into gratitude.',
    gearList: [
      { item: 'Trekking Shoes (Quechua MH500)', description: 'Walked through mud, snow, sand, and monsoon asphalt across 28 states.' },
      { item: '45L Rucksack', description: 'Carried 3 quick-dry shirts, 2 trousers, rain poncho, and a sleeping liner.' },
      { item: 'Fujifilm X-T30 + 18-55mm lens', description: 'Documented 12,000+ raw portraits and landscape frames.' },
      { item: 'Hardcover Moleskine Journal', description: 'Filled cover-to-cover with daily pencil notes, bus ticket stubs, and folk recipes.' }
    ],
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    travelShoePhoto: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
  },
  instagram: {
    handle: '@2shoes2faar',
    profileUrl: 'https://instagram.com/2shoes2faar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    followerCountFormatted: '',
    postCountFormatted: '',
    bio: 'Solo traveller across 28 Indian States in 28 Weeks 🇮🇳 • Author of "India - 28 States in 28 Weeks" 📖 • 2Shoes2Faar 👟✨',
    recentMedia: []
  },
  contact: {
    email: 'channveer.shankad@gmail.com',
    whatsapp: '+91 98765 43210',
    location: 'Bengaluru / Hubballi, Karnataka, India',
    googleFormUrl: 'https://forms.gle/Nj13LtV9ATqHt8EJA'
  }
};
