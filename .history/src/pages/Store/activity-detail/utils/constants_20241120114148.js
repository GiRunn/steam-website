// src/pages/store/activity-detail/utils/constants.js
  // 以下为活动数据
  export const ACTIVITIES_DATA = [
    {
      id: 1,
      banner: {
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/header.jpg",
        title: "DOTA2 国际邀请赛 2024",
        subtitle: "全球顶级电竞赛事"
      },
      info: {
        title: "TI2024 中国大师赛",
        description: "2024年度DOTA2最重要的赛事，云集全球顶尖战队，见证电竞传奇的诞生。现场设有粉丝互动区、选手见面会、周边限定购等精彩内容。",
        date: "2024-08-15",
        location: "上海梅赛德斯-奔驰文化中心",
        capacity: 18000,
        price: {
          regular: 688,
          vip: 1688
        },
        highlights: [
          "18支顶级战队同台竞技",
          "限定款周边礼品包",
          "选手见面会优先席位",
          "VIP专属观赛区域"
        ],
        tags: ["电竞", "DOTA2", "TI赛事", "线下活动"]
      },
      schedule: [
        {
          time: "10:00",
          title: "开幕式",
          description: "开幕表演及战队入场仪式"
        },
        {
          time: "11:00",
          title: "小组赛 Day1",
          description: "BO2 淘汰赛制"
        },
        {
          time: "19:00",
          title: "粉丝见面会",
          description: "参赛战队粉丝互动环节"
        }
      ],
      media: {
        images: [
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/570/ss_86d675fdc73ba10462abb8f5ece7791c5047072c.jpg",
            title: "比赛现场"
          },
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/570/ss_f9ebafcf82cd566cbab88d54656a10581892e771.jpg",
            title: "赛事精彩时刻"
          },
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/570/ss_ad8eee787704745ccdecdfde3a5cd2733704898d.jpg",
            title: "选手备战区"
          }
        ],
        videos: [
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/256692027/movie480.webm",
            title: "赛事宣传片",
            thumbnail: "https://media.st.dl.eccdnx.com/steam/apps/570/capsule_616x353.jpg"
          }
        ]
      },
      preview: {
        thumbnailUrl: "https://media.st.dl.eccdnx.com/steam/apps/570/header.jpg",
        title: "DOTA2 国际邀请赛 2024",
        date: "2024-08-15",
        location: "上海梅赛德斯-奔驰文化中心",
        price: 688
      }
    },
    {
      id: 2,
      banner: {
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/730/header.jpg",
        title: "CS2 Major 上海站",
        subtitle: "首届中国大型CS2职业赛事"
      },
      info: {
        title: "CS2 Major 上海站",
        description: "首次在中国举办的CS2 Major赛事，16支世界顶级战队齐聚上海，角逐200万美元奖金池。",
        date: "2024-09-20",
        location: "国家会展中心（上海）",
        capacity: 15000,
        price: {
          regular: 488,
          vip: 1288
        },
        highlights: [
          "顶级战队巅峰对决",
          "职业选手见面会",
          "游戏周边专属折扣",
          "VIP专属休息区"
        ],
        tags: ["电竞", "CS2", "Major赛事", "线下活动"]
      },
      schedule: [
        {
          time: "09:30",
          title: "开幕式",
          description: "开幕表演及抽签仪式"
        },
        {
          time: "10:30",
          title: "小组赛首日",
          description: "BO3 双败淘汰制"
        },
        {
          time: "18:00",
          title: "花絮环节",
          description: "选手采访及精彩集锦"
        }
      ],
      media: {
        images: [
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/730/ss_118cb022b9b43f70d2e5a2df7427f29088b6b191.jpg",
            title: "比赛现场"
          },
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/730/ss_d196d945c6170e9cadaf67a6dea675bd5fa7a046.jpg",
            title: "赛事精彩时刻"
          },
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/730/ss_34090867f1a02b6c722f307362a2618790aa033a.jpg",
            title: "观众区"
          }
        ],
        videos: [
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/256843155/movie480.webm",
            title: "赛事宣传片",
            thumbnail: "https://media.st.dl.eccdnx.com/steam/apps/730/capsule_616x353.jpg"
          }
        ]
      },
      preview: {
        thumbnailUrl: "https://media.st.dl.eccdnx.com/steam/apps/730/header.jpg",
        title: "CS2 Major 上海站",
        date: "2024-09-20",
        location: "国家会展中心（上海）",
        price: 488
      }
    },
    {
      id: 3,
      banner: {
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/1172470/header.jpg",
        title: "英雄联盟 S14 全球总决赛",
        subtitle: "2024英雄联盟全球总决赛"
      },
      info: {
        title: "英雄联盟 S14 全球总决赛",
        description: "2024年英雄联盟最重要的国际赛事，全球顶尖战队齐聚一堂，见证新的王者诞生。",
        date: "2024-10-15",
        location: "北京国家体育场鸟巢",
        capacity: 80000,
        price: {
          regular: 888,
          vip: 2888
        },
        highlights: [
          "开幕式明星表演",
          "冠军皮肤预览",
          "互动观赛体验",
          "专属周边礼包"
        ],
        tags: ["电竞", "英雄联盟", "S赛", "线下活动"]
      },
      schedule: [
        {
          time: "16:00",
          title: "开幕式",
          description: "开幕式表演及战队出场"
        },
        {
          time: "17:30",
          title: "总决赛",
          description: "BO5 最终对决"
        },
        {
          time: "23:00",
          title: "颁奖仪式",
          description: "冠军颁奖及表演环节"
        }
      ],
      media: {
        images: [
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/1172470/ss_9db45283e42e8fff32c366f40b0642cfb984897d.jpg",
            title: "比赛现场"
          },
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/1172470/ss_65861a095f8d8e21e1fa54df3a0a7b5c1d168lie.jpg",
            title: "观众席"
          },
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/1172470/ss_d1a8f5106e4d13d17f42666691275d60c84797ed.jpg",
            title: "舞台效果"
          }
        ],
        videos: [
          {
            url: "https://media.st.dl.eccdnx.com/steam/apps/256901466/movie480.webm",
            title: "赛事宣传片",
            thumbnail: "https://media.st.dl.eccdnx.com/steam/apps/1172470/capsule_616x353.jpg"
          }
        ]
      },
      preview: {
        thumbnailUrl: "https://media.st.dl.eccdnx.com/steam/apps/1172470/header.jpg",
        title: "英雄联盟 S14 全球总决赛",
        date: "2024-10-15",
        location: "北京国家体育场鸟巢",
        price: 888
      }
    }
  ];

export const getActivityById = (id) => {
  return ACTIVITIES_DATA.find(activity => activity.id === parseInt(id));
};

// 导出获取活动预览列表的辅助函数
export const getActivityPreviews = () => {
  return ACTIVITIES_DATA.map(activity => ({
    id: activity.id,
    ...activity.preview
  }));
};