import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="text-2xl font-bold text-emerald-700">
          EcoWheels
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
            Home
          </Link>
          <Link href="/cars" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
            Sản phẩm
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
            Contact
          </Link>
          <Link href="/about-us" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
            About us
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/owner/register"
            className="hidden h-10 items-center justify-center rounded-md bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700 sm:inline-flex"
          >
            Đăng ký chủ xe
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-600 px-4 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
