import Link from "next/link";
import { NavbarUserMenu } from "./NavbarUserMenu";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 hidden sm:block">
            StudyMate
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <Link href="#" className="hover:text-purple-600 transition">Khóa học</Link>
          <Link href="#" className="hover:text-purple-600 transition">Sự kiện</Link>
          <Link href="#" className="hover:text-purple-600 transition">Blog</Link>
        </nav>

        <SearchBar />

        <NavbarUserMenu />
      </div>
    </header>
  );
}
