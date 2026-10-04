import { motion } from 'framer-motion';

const items = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.35-7-10a5 5 0 0110-2 5 5 0 0110 2c0 5.65-7 10-7 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l2 2 4-4" />
      </svg>
    ),
    title: 'Sứ mệnh',
    desc:
      'Bảo vệ quyền lợi và an toàn của phụ nữ lao động, đồng hành cùng họ trên hành trình vươn tới tương lai tốt đẹp hơn.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
      </svg>
    ),
    title: 'Tầm nhìn',
    desc:
      'Xây dựng cộng đồng nơi mọi phụ nữ lao động được tôn trọng, an toàn và có cơ hội phát triển bình đẳng.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
      </svg>
    ),
    title: 'Giá trị',
    desc:
      'Minh bạch, đồng cảm và kiên định — chúng tôi tin rằng mỗi câu chuyện đều xứng đáng được lắng nghe và bảo vệ.',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            Về chúng tôi
          </p>
          <h3 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
            Giới thiệu dự án
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-primary-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary-100"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 text-white shadow-md shadow-primary-200 transition-transform group-hover:scale-110">
                {it.icon}
              </div>
              <h4 className="text-xl font-bold text-primary-700">{it.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}