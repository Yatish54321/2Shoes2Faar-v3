import { Supporter } from '../types';

/**
 * Clean production supporter list.
 * Live data is dynamically fetched from real Google Form submissions and server database.
 * No dummy / mock supporters are hardcoded.
 */
export const SEED_SUPPORTERS: Supporter[] = [];

/**
 * Generates sample demonstration supporters if activated in admin panel.
 */
export function generateFullDemonstrationSupporters(): Supporter[] {
  const sampleData = [
    { name: 'Aarav Sharma', city: 'Bengaluru', state: 'Karnataka', comment: 'Every corner of India tells an untold story waiting to be heard.', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ananya Deshmukh', city: 'Pune', state: 'Maharashtra', comment: 'Traveling solo taught me that kindness has no geographical boundaries.', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Rohan Banerjee', city: 'Kolkata', state: 'West Bengal', comment: 'Mountains in the north to coastlines in the south—India is an endless book.', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kavya Nair', city: 'Kochi', state: 'Kerala', comment: 'Backpacking through 28 states is an inspiring tribute to the spirit of exploration.', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
    { name: 'Vikramjit Singh', city: 'Amritsar', state: 'Punjab', comment: 'Chai at roadside dhabas and genuine conversations are the true wealth of travel.', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Pooja Hegde', city: 'Mangaluru', state: 'Karnataka', comment: 'Proud to be part of the 1,000 living voices on this historic India mosaic!', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }
  ];

  return sampleData.map((item, idx) => ({
    id: `sup-demo-${idx + 1}`,
    supporterNumber: idx + 1,
    fullName: item.name,
    email: `demo.${item.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    city: item.city,
    state: item.state,
    travelComment: item.comment,
    photoUrl: item.photo,
    featured: true,
    approved: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
    source: 'manual_admin',
    orderStatus: 'payment_verified',
    amountPaid: 499
  }));
}
