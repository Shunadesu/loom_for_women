export default function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-500">
        <p className="font-semibold text-primary-600">Loom for Women</p>
        <p className="mt-1">Hồ Chiêu An Toàn — Vì phụ nữ, vì tương lai</p>
        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} Loom for Women. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
}