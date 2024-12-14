// src/pages/store/activity-detail/index.jsx
import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useActivityData } from './hooks/useActivityData';

// 懒加载组件
const Banner = React.lazy(() => import('./components/Banner'));
const ActivityInfo = React.lazy(() => import('./components/ActivityInfo'));
const MediaGallery = React.lazy(() => import('./components/MediaGallery'));
const Schedule = React.lazy(() => import('./components/Schedule'));
const Registration = React.lazy(() => import('./components/Registration'));
const RelatedActivities = React.lazy(() => import('./components/RelatedActivities'));

const ActivityDetail = () => {
  const { activityData, isLoading, error } = useActivityData();

  if (isLoading) return <LoadingScreen />;
  if (error) return <div>Error loading activity data</div>;

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingScreen />}>
          <Banner data={activityData.banner} />
          <ActivityInfo data={activityData.info} />
          <MediaGallery data={activityData.media} />
          <Schedule data={activityData.schedule} />
          <Registration data={activityData.registration} />
          <RelatedActivities data={activityData.relatedActivities} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityDetail;