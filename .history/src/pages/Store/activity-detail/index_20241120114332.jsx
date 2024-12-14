// src/pages/store/activity-detail/index.jsx
import React, { Suspense } from 'react';
import Navbar from '../../../components/Navbar';  // 修改为相对路径
import Footer from '../../../components/Footer';  // 修改为相对路径
import LoadingScreen from '../../../components/LoadingScreen';  // 修改为相对路径
import { ACTIVITY_DATA } from './utils/constants';

// 懒加载组件
const Banner = React.lazy(() => import('./components/Banner/index'));  // 添加/index
const ActivityInfo = React.lazy(() => import('./components/ActivityInfo/index'));  // 添加/index
const MediaGallery = React.lazy(() => import('./components/MediaGallery/index'));  // 添加/index
const Schedule = React.lazy(() => import('./components/Schedule/index'));  // 添加/index
const Registration = React.lazy(() => import('./components/Registration/index'));  // 添加/index
const RelatedActivities = React.lazy(() => import('./components/RelatedActivities/index'));  // 添加/index

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