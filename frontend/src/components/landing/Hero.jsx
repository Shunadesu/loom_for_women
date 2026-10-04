import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Decorative blobs */}
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-primary-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-700"
        >
          Hồ Chiêu An Toàn
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl"
        >
          Đem an toàn và hy vọng
          <br />
          <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-400 bg-clip-text text-transparent">
            cho phụ nữ Việt
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg"
        >
          Cùng Loom for Women mang đến sự an toàn, hy vọng và tương lai tốt đẹp cho
          lao động nữ. Hồ chiêu của chúng tôi là người bạn đồng hành tin cậy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#about" className="btn-primary">
            Tìm hiểu thêm
          </a>
          <a href="#cta" className="btn-outline">
            Đăng ký ngay
          </a>
        </motion.div>
      </div>
    </section>
  );
}