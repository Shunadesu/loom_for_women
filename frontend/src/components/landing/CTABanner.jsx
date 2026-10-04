import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore.js';

export default function CTABanner() {
  const user = useAuthStore((s) => s.user);

  return (
    <section id="cta" className="px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-400 px-6 py-14 text-center text-white shadow-2xl shadow-primary-200 md:px-12 md:py-20"
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          {user ? (
            <>
              <h3 className="text-3xl font-extrabold md:text-4xl">
                Chào mừng {user.name} đã gia nhập cùng Loom!
              </h3>
              <p className="mt-3 text-base text-white/90 md:text-lg">
                Hành trình an toàn của bạn bắt đầu từ đây.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-3xl font-extrabold md:text-4xl">
                Sẵn sàng đồng hành cùng chúng tôi?
              </h3>
              <p className="mt-3 text-base text-white/90 md:text-lg">
                Đăng ký ngay để nhận hỗ trợ và cập nhật từ Loom for Women.
              </p>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.location.reload(); }}
                className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-bold text-primary-600 shadow-lg transition hover:scale-105 hover:bg-primary-50"
              >
                Đăng ký tài khoản
              </a>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}