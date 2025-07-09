import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <i className="fas fa-ticket-alt text-primary text-2xl mr-3"></i>
              <span className="font-bold text-xl text-slate-900">CouponAPI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className={`transition-colors ${
                isActive("/") 
                  ? "text-primary font-medium" 
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/api-docs" 
              className={`transition-colors ${
                isActive("/api-docs") 
                  ? "text-primary font-medium" 
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              API Docs
            </Link>
            <Link 
              href="/admin" 
              className={`transition-colors ${
                isActive("/admin") 
                  ? "text-primary font-medium" 
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
