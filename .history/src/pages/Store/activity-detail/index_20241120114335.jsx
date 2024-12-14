// src/pages/store/activity-detail/index.jsx
import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { ACTIVITIES_DATA, getActivityById } from './utils/constants';  // 修改导入

// 懒加载组件
const Banner = React.lazy(() => import('./components/Banner'));
const ActivityInfo = React.lazy(() => import('./components/ActivityInfo'));
const MediaGallery = React.lazy(() => import('./components/MediaGallery'));
const Schedule = React.lazy(() => import('./components/Schedule'));
const Registration = React.lazy(() => import('./components/Registration'));
const RelatedActivities = React.lazy(() => import('./components/RelatedActivities'));

const ActivityDetail = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const activityData = getActivityById(Number(id));
    setActivity(activityData);
  }, [id]);

  if (!activity) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingScreen />}>
          <Banner data={activity.banner} />
          <ActivityInfo data={activity.info} />
          <MediaGallery data={activity.media} />
          <Schedule data={activity.schedule} />
          <Registration data={activity.info} />
          <RelatedActivities data={ACTIVITIES_DATA} />  {/* 修改这里 */}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityDetail;