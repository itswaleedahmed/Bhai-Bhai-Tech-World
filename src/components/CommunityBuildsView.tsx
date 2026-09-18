import React, { useEffect } from 'react';
import { BuildShowcase } from './BuildShowcase';
import { scrollToTop } from '../utils/scroll';

export const CommunityBuildsView: React.FC = () => {
  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <div className="py-8 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <BuildShowcase
        title="Community Build Showcase"
        subtitle="Explore top-rated battlestations and custom rigs submitted by verified Bhai Bhai Tech World customers with real benchmarks and 1-click Copy to Builder."
      />
    </div>
  );
};
