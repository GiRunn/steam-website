// src/components/aboutContent.js
// About页面的内容数据

export const aboutContent = {
    title: "关于我们",
    subtitle: "致力于为用户提供最优质的游戏体验",
    // Bilibili视频示例
    videoUrl: "//player.bilibili.com/player.html?aid=954596752&bvid=BV1sW4y1m7rk&cid=1324311566&p=1",
    // 视频封面使用游戏相关的高清图片
    videoPoster: "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg",
    sections: [
      {
        id: "intro",
        title: "让游戏创造无限可能",
        content: `
          <p>我们是一家充满激情的游戏平台，致力于为全球玩家提供优质的游戏体验。从2003年成立至今，
          我们始终坚持以用户为中心，不断创新和优化平台服务。</p>
          
          <p>通过持续的技术创新和服务升级，我们打造了一个全方位的游戏生态系统，涵盖游戏分发、
          社区互动、云游戏等多个领域，让玩家能够尽情享受游戏的乐趣。</p>
        `,
        // 使用Unsplash的游戏相关图片
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=60"
      },
      {
        id: "technology",
        title: "技术驱动体验",
        content: `
          <p>依托强大的技术基础设施，我们为用户提供稳定、快速的游戏下载和更新服务。通过智能推荐
          算法，让每位玩家都能找到最适合自己的游戏。</p>
  
          <p>我们的云游戏技术让玩家无需下载即可体验游戏，突破了硬件限制，让更多人能够享受到
          高品质的游戏体验。</p>
        `,
        image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&auto=format&fit=crop&q=60"
      },
      {
        id: "community",
        title: "共建游戏社区",
        content: `
          <p>在这里，玩家不仅能享受游戏，更能找到志同道合的伙伴。我们打造了丰富的社交功能，
          支持玩家分享游戏时刻、交流心得、组队游戏。</p>
  
          <p>通过举办各类活动和比赛，我们为玩家创造更多互动和交流的机会，让游戏社区更加
          活跃和有趣。</p>
        `,
        image: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200&auto=format&fit=crop&q=60"
      },
      {
        id: "future",
        title: "展望未来",
        content: `
          <p>游戏产业正在经历前所未有的变革，我们将继续投资新技术，探索元宇宙、VR/AR等
          创新领域，为玩家带来更震撼的游戏体验。</p>
  
          <p>我们期待与全球的游戏开发者和玩家一起，共同打造更精彩的游戏世界。</p>
        `,
        image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1200&auto=format&fit=crop&q=60"
      }
    ]
  };