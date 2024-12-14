// src/pages/store/activity-detail/index.jsx
import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar';  // 修改为默认导入
import Footer from '../../../components/Footer';  // 修改为默认导入
import LoadingScreen from '../../../components/LoadingScreen';  // 修改为默认导入
import { ACTIVITIES_DATA, getActivityById } from './utils/constants';

// 懒加载组件
const Banner = React.lazy(() => import('./components/Banner'));
const ActivityInfo = React.lazy(() => import('./components/ActivityInfo'));
const MediaGallery = React.lazy(() => import('./components/MediaGallery'));

const Registration = React.lazy(() => import('./components/Registration'));


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

          <Registration data={activity.info} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityDetail;