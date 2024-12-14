// src/pages/store/activity-detail/index.jsx
import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ACTIVITY_DATA } from './utils/constants';

// 懒加载组件
const Banner = React.lazy(() => import('./components/Banner'));
const ActivityInfo = React.lazy(() => import('./components/ActivityInfo'));
const MediaGallery = React.lazy(() => import('./components/MediaGallery'));
const Schedule = React.lazy(() => import('./components/Schedule'));
const Registration = React.lazy(() => import('./components/Registration'));
const RelatedActivities = React.lazy(() => import('./components/RelatedActivities'));

const ActivityDetail = () => {
  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingScreen />}>
          <Banner data={ACTIVITY_DATA.banner} />
          <ActivityInfo data={ACTIVITY_DATA.info} />
          <MediaGallery data={ACTIVITY_DATA.media} />
          <Schedule data={ACTIVITY_DATA.schedule} />
          <Registration data={ACTIVITY_DATA.info} />
          <RelatedActivities data={ACTIVITY_DATA.relatedActivities} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityDetail;