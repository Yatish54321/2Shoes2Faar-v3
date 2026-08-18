export interface Supporter {
  id: string;
  supporterNumber: number; // e.g. 1 to 1000
  fullName: string;
  email: string;
  whatsappNumber?: string;
  instagramHandle?: string;
  city: string;
  state: string;
  region?: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast' | 'islands';
  pinCode?: string;
  travelComment: string; // "What makes you travel?"
  photoUrl: string;
  paymentProofUrl?: string;
  featured: boolean; // whether they opted to be on the India Mosaic (User Form Locked)
  approved: boolean; // admin approval status
  status: 'pending' | 'approved' | 'rejected';
  paymentVerified?: boolean; // admin verified payment
  paymentVerifiedAt?: string;
  mapCellId?: string; // id of the grid cell on India map
  mapX?: number; // grid col (0-35)
  mapY?: number; // grid row (0-43)
  createdAt: string;
  updatedAt?: string;
  adminNote?: string;
  source: 'google_form' | 'website_order' | 'manual_admin';
  sourceSubmissionId?: string;
  deliveryAddress?: string;
  orderStatus?: 'pending' | 'payment_verified' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  amountPaid?: number;
}

export interface MosaicCell {
  cellId: string; // e.g. "cell-12-18"
  x: number; // column in grid
  y: number; // row in grid
  pixelX?: number;
  pixelY?: number;
  leftPercent?: number;
  topPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  normX?: number; // normalized 0-1 x coordinate
  normY?: number; // normalized 0-1 y coordinate
  normWidth?: number; // normalized width
  normHeight?: number; // normalized height
  valid: boolean; // is within India silhouette
  isBlackTile?: boolean; // is pure black placeholder tile
  region?: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast' | 'islands';
  stateName?: string;
  cityName?: string;
  supporterId?: string;
  supporter?: Supporter;
  isFeatured?: boolean;
  clusterIndex?: number;
  clusterSize?: number;
}

export interface JourneyState {
  id: string;
  stateNumber: number; // 1 to 28
  name: string;
  capital: string;
  week: number;
  distanceKm: number;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North East';
  coverImage: string;
  galleryImages: string[];
  quote: string;
  storySnippet: string;
  highlights: string[];
  memorableEncounter: string;
  localFood: string;
  coordinates: { x: number; y: number }; // normalized 0-100 for map display
}

export interface BookOrder {
  id: string;
  customerName: string;
  email: string;
  whatsappNumber: string;
  city: string;
  state: string;
  pinCode: string;
  deliveryAddress: string;
  instagramHandle?: string;
  featuredPreference: boolean;
  travelComment?: string;
  photoUrl?: string;
  paymentProofUrl?: string;
  paymentRefNumber?: string;
  amount: number; // default 499
  paymentStatus: 'pending' | 'submitted' | 'verified' | 'failed';
  orderStatus: 'pending' | 'payment_verified' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  adminNotes?: string;
  supporterId?: string;
}

export interface GoogleSubmission {
  id: string;
  timestamp: string;
  email: string;
  fullName: string;
  whatsappNumber: string;
  instagramHandle?: string;
  city: string;
  state: string;
  pinCode: string;
  featuredPreference: 'Yes, feature me on India map' | 'No, only pre-order book' | string;
  travelPhilosophy: string;
  deliveryAddress: string;
  photoUrl: string;
  paymentProofUrl: string;
  syncStatus: 'synced' | 'pending_review' | 'processed' | 'approved' | 'rejected' | 'deleted_by_admin';
  assignedSupporterId?: string;
}

export interface DeletedSupporterRecord {
  id: string;
  supporter: Supporter;
  deletedAt: string;
  deletedBy: string;
  reason?: string;
  originalSupporterNumber: number;
  originalMapCellId?: string;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    highlightText: string;
    authorName: string;
    authorTitle: string;
    heroImage: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  journeyStats: {
    totalStates: number;
    totalWeeks: number;
    totalDistanceKm: number;
    totalSupportersTarget: number;
    currentSupportersCount: number;
    storiesCollected: number;
  };
  book: {
    title: string;
    subtitle: string;
    author: string;
    price: number;
    originalPrice: number;
    currency: string;
    coverImage: string;
    description: string;
    pageCount: number;
    highlights: string[];
    sampleQuotes: string[];
    deliveryInfo: string;
  };
  about: {
    headline: string;
    bioParagraph1: string;
    bioParagraph2: string;
    bioParagraph3: string;
    philosophy: string;
    gearList: { item: string; description: string }[];
    authorPhoto: string;
    travelShoePhoto: string;
  };
  instagram: {
    handle: string;
    profileUrl: string;
    avatarUrl: string;
    followerCountFormatted: string;
    postCountFormatted: string;
    bio: string;
    recentMedia: {
      id: string;
      caption: string;
      imageUrl: string;
      likes: number;
      comments: number;
      postUrl: string;
    }[];
  };
  contact: {
    email: string;
    whatsapp: string;
    location: string;
    googleFormUrl: string;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
  targetId?: string;
  entityId?: string;
}

export type ThemeMode = 'light' | 'dark';

