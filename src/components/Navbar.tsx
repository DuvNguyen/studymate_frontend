import Link from "next/link";
import { NavbarUserMenu } from "./NavbarUserMenu";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full bg-white border-b-4 border-black z-50 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 active:translate-y-0.5 active:translate-x-0.5 transition-transform">
          <div className="w-8 h-8 bg-amber-300 border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">S</div>
          <span className="text-2xl font-black text-black uppercase tracking-tighter hidden sm:block">
            StudyMate
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-black uppercase tracking-widest text-black">
          <Link href="#" className="hover:bg-amber-300 px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Khóa học</Link>
          <Link href="#" className="hover:bg-amber-300 px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Sự kiện</Link>
          <Link href="#" className="hover:bg-amber-300 px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Blog</Link>
        </nav>

        <div className="flex flex-row items-center gap-4">
          <SearchBar />
          <NavbarUserMenu />
        </div>
      </div>
    </header>
  );
}
