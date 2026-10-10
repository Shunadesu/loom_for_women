import { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import { useHeroStore } from '../../store/heroStore.js';
import { resolveImageUrl } from '../../utils/imageUrl.js';

function Skeleton() {
  return (
    <div className="flex aspect-[16/9] w-full animate-pulse items-center justify-center rounded-3xl bg-slate-100 sm:aspect-[21/9]">
      <span className="text-xs text-slate-400">Đang tải banner…</span>
    </div>
  );
}

function SingleImg({ hero }) {
  const img = (
    <img
      src={resolveImageUrl(hero.imageUrl)}
      alt={hero.alt || 'Hero banner'}
      loading="lazy"
      className="block h-auto w-full object-cover"
    />
  );
  if (hero.link) {
    return (
      <a href={hero.link} target="_blank" rel="noopener noreferrer" className="block">
        {img}
      </a>
    );
  }
  return img;
}

export default function HeroBanner() {
  const heroes = useHeroStore((s) => s.heroes);
  const loading = useHeroStore((s) => s.loading);
  const fetchPublic = useHeroStore((s) => s.fetchPublic);

  useEffect(() => {
    if (heroes.length === 0) fetchPublic();
  }, [fetchPublic, heroes.length]);

  if (loading && heroes.length === 0) {
    return <Skeleton />;
  }

  if (heroes.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 sm:aspect-[21/9]">
        <span className="text-xs text-slate-400">Chưa có banner nào.</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100/80 bg-white shadow-sm">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop={heroes.length > 1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="hero-swiper"
      >
        {heroes.map((h) => (
          <SwiperSlide key={h._id}>
            <SingleImg hero={h} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}