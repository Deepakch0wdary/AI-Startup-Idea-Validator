'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Lightbulb, 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  Crown
} from 'lucide-react';
import { api } from '@/lib/api';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Pages where Navigation should NOT show
  const isAuthPage = ['/login', '/register', '/'].includes(pathname);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  if (isAuthPage) return null;

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Validate Idea', href: '/validate', icon: PlusCircle },
    { name: 'AI Mentor', href: '/mentor', icon: MessageSquare },
  ];

  if (user?.role === 'ADMIN') {
    links.push({ name: 'Admin Control', href: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-violet-400 font-bold text-xl font-outfit">
              <Lightbulb className="w-6 h-6 animate-pulse" />
              <span>Antigravity <span className="text-white">Validator</span></span>
            </Link>
            
            {/* Desktop Navigation Link items */}
            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className={`flex items-center gap-2 text-sm font-medium transition-all ${
                      isActive ? 'text-violet-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <UserIcon className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-gray-200">{user.name}</span>
                {user.role === 'ADMIN' && (
                  <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Crown className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
            )}

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-rose-400 text-sm font-medium cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile hamburger menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-[#0b0f19] pt-20 px-4 flex flex-col gap-6 md:hidden no-print">
          <div className="flex flex-col gap-4">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-gray-300 hover:text-white py-3 border-b border-white/5"
                >
                  <Icon className="w-5 h-5 text-violet-400" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="mt-auto mb-8 flex flex-col gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-violet-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                {user.role === 'ADMIN' && (
                  <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-md border border-amber-500/20">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-3 rounded-xl border border-rose-500/20 font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
