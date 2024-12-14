// 组件导入
import HeroSlider from './components/HeroSlider';
import BrandShowcase from './components/BrandShowcase';
import VideoSection from './components/VideoSection';
import OfferSection from './components/OfferSection';
import ProductFeatures from './components/ProductFeatures';
import GameCard from '../../components/GameCard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// 常量导入
import { MOCK_GAMES, MOCK_VIDEOS, MOCK_OFFERS, MOCK_PARTNERS } from './constants';

// 本地化导入
import enLocale from '../../locales/en';
import zhLocale from '../../locales/zh';

import './styles.css';

// 游戏展示区块组件
const GameShowcaseSection = ({ title, games, isVisible }) => {
  if (!games || games.length === 0) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="game-section"
    >
      <h2 className="section-title text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>
    </motion.section>
  );
};


const Homepage = () => {
  // 状态管理
  const [locale, setLocale] = useState(() => localStorage.getItem('language') || 'en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);

  // refs
  const introRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // 预处理游戏数据
  const gamesBySection = React.useMemo(() => {
    const newReleases = MOCK_GAMES.filter(game => game.sectionId === 'new-releases');
    const topSellers = MOCK_GAMES.filter(game => game.sectionId === 'top-sellers');
    
    return {
      newReleases,
      topSellers
    };
  }, []);

  // 处理拖动事件
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX - dragOffset);
    cancelAnimationFrame(animationRef.current);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startAutoScroll();
  };

  // 自动滚动
  const startAutoScroll = () => {
    const animate = () => {
      setDragOffset(prev => {
        const newOffset = prev + 2;
        return newOffset >= containerRef.current?.scrollWidth ? 0.5 : newOffset;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  // 副作用处理
  useEffect(() => {
    startAutoScroll();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (introRef.current) {
      observer.observe(introRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // 获取语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 幻灯片数据
  const slides = [
    { id: 1, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 1` },
    { id: 2, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 2` },
    { id: 3, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 3` }
  ];

  return (
    <div className={`homepage ${darkMode ? 'dark' : ''}`}>
      <div className="background-gradient"/>
      
      <Navbar 
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        locale={locale}
        toggleLocale={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      />

      <main className="main-content">
        <HeroSlider 
          slides={slides}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
        <BrandShowcase brandLogos={MOCK_PARTNERS} /> {/* 修改这里，使用 MOCK_PARTNERS */}

        <div className="games-showcase" ref={introRef}>
          {/* 新品推荐 */}
          <section className="game-section">
            {MOCK_GAMES.filter(game => game.sectionId === 'new-releases')
              .map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={index}
                  isVisible={isVisible}
                />
            ))}
          </section>

          {/* 热销榜单 */}
          <section className="game-section">
            {MOCK_GAMES.filter(game => game.sectionId === 'top-sellers')
              .map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={index}
                  isVisible={isVisible}
                />
            ))}
          </section>
        </div>

        <VideoSection 
          videoList={MOCK_VIDEOS}
          setShowVideo={setShowVideo}
        />

        <ProductFeatures />

        <OfferSection specialOffers={MOCK_OFFERS} />
      </main>

      <Footer 
        darkMode={darkMode}
        t={t}
        showVideo={showVideo}
        setShowVideo={setShowVideo}
      />
    </div>
  );
};

export default Homepage;