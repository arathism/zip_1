// app/dashboard/layout.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name}
              </span>
              <Link 
                href="/dashboard/profile" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-4">
            {user.role === 'student' && (
              <>
                <Link href="/dashboard/complaints" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  My Complaints
                </Link>
                <Link href="/dashboard/new-complaint" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  New Complaint
                </Link>
              </>
            )}
            {user.role === 'staff' && (
              <>
                <Link href="/dashboard/assigned-complaints" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  Assigned Complaints
                </Link>
                <Link href="/dashboard/resolved-complaints" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  Resolved Complaints
                </Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link href="/dashboard/all-complaints" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  All Complaints
                </Link>
                <Link href="/dashboard/users" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  Manage Users
                </Link>
                <Link href="/dashboard/reports" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  Reports
                </Link>
              </>
            )}
            <Link href="/dashboard/profile" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              My Profile
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}