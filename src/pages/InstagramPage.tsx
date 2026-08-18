import React from 'react';
import { InstagramFeed } from '../components/InstagramFeed';
import { SiteContent } from '../types';

interface InstagramPageProps {
  content: SiteContent['instagram'];
}

export const InstagramPage: React.FC<InstagramPageProps> = ({ content }) => {
  return (
    <div id="instagram-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-editorial text-4xl font-bold text-[#1C1917] dark:text-stone-100">
          Live Field Stories from the Road
        </h1>
        <p className="text-sm text-[#57534E] dark:text-stone-300">
          Real-time moments, reel snippets, and photo plates shared with our community of explorers on Instagram.
        </p>
      </div>

      <InstagramFeed instagram={content} />
    </div>
  );
};
