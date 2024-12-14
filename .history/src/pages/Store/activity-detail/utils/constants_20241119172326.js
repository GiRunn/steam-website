// src/pages/store/activity-detail/utils/constants.js
export const ACTIVITY_DATA = {
    banner: {
      imageUrl: "/images/activity-banner.jpg", // 这里使用实际的图片路径
      title: "2024年度电竞嘉年华",
      subtitle: "线下专业电竞赛事活动"
    },
    info: {
      title: "活动详情",
      description: "这是一场专业级别的电竞赛事活动，融合了多个热门游戏项目的比赛...",
      date: "2024-12-01",
      location: "上海市电竞中心",
      capacity: 1000,
      price: {
        regular: 299,
        vip: 599
      },
      highlights: [
        "专业选手现场表演赛",
        "明星选手见面会",
        "游戏周边限定礼品",
        "VIP专属观赛区域"
      ],
      tags: ["电竞", "游戏", "线下活动", "比赛"]
    },
    schedule: [
      {
        time: "09:00",
        title: "开幕式",
        description: "活动开幕仪式及嘉宾致辞"
      },
      {
        time: "10:00",
        title: "小组赛",
        description: "各项目小组赛同时开始"
      },
      {
        time: "14:00",
        title: "明星表演赛",
        description: "知名选手表演赛"
      },
      {
        time: "16:00",
        title: "决赛",
        description: "各项目总决赛"
      }
    ],
    media: {
      images: [
        {
          url: "/images/activity-1.jpg",
          title: "现场图片1"
        },
        {
          url: "/images/activity-2.jpg",
          title: "现场图片2"
        }
      ],
      videos: [
        {
          url: "/videos/promo.mp4",
          title: "活动宣传片",
          thumbnail: "/images/video-thumb.jpg"
        }
      ]
    },
    relatedActivities: [
      {
        id: 1,
        title: "王者荣耀城市赛",
        imageUrl: "/images/related-1.jpg",
        date: "2024-12-15"
      },
      {
        id: 2,
        title: "英雄联盟表演赛",
        imageUrl: "/images/related-2.jpg",
        date: "2024-12-20"
      }
    ]
  };