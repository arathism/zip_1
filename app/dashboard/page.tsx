// app/dashboard/page.tsx (Main dashboard)
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Redirect based on role if needed
        if (data.user.role === 'student') {
          // Student stays on main dashboard
        } else if (data.user.role === 'staff') {
          // Staff stays on main dashboard
        } else if (data.user.role === 'admin') {
          // Admin stays on main dashboard
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/login');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to your Dashboard, {user.name}!
        </h1>
        
        {/* Role-based content */}
        {user.role === 'student' && <StudentDashboard user={user} />}
        {user.role === 'staff' && <StaffDashboard user={user} />}
        {user.role === 'admin' && <AdminDashboard user={user} />}
      </div>
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({ pending: 0, resolved: 0, total: 0 });

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints?userId=' + user.id + '&role=student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const complaints = data.complaints || [];
        const pending = complaints.filter((c: any) => 
          ['pending', 'in-progress'].includes(c.status)
        ).length;
        const resolved = complaints.filter((c: any) => 
          c.status === 'resolved'
        ).length;
        
        setStats({
          pending,
          resolved,
          total: complaints.length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pending Complaints</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Resolved Complaints</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Complaints</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.href = '/dashboard/complaints'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View My Complaints
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/new-complaint'}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit New Complaint
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/profile'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// Staff Dashboard Component
function StaffDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({ assigned: 0, resolved: 0 });

  useEffect(() => {
    fetchStaffStats();
  }, []);

  const fetchStaffStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints?staffId=' + user.id + '&role=staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const complaints = data.complaints || [];
        const assigned = complaints.filter((c: any) => 
          ['assigned', 'in-progress'].includes(c.status)
        ).length;
        const resolved = complaints.filter((c: any) => 
          c.status === 'resolved'
        ).length;
        
        setStats({ assigned, resolved });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Assigned Complaints</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.assigned}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Resolved Complaints</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.href = '/dashboard/assigned-complaints'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Assigned Complaints
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/profile'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({ users: 0, activeComplaints: 0, resolvedComplaints: 0 });

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user count
      const usersResponse = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      
      // Fetch complaints count
      const complaintsResponse = await fetch('/api/complaints?role=admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const complaintsData = await complaintsResponse.json();
      
      const complaints = complaintsData.complaints || [];
      const activeComplaints = complaints.filter((c: any) => 
        ['pending', 'assigned', 'in-progress'].includes(c.status)
      ).length;
      const resolvedComplaints = complaints.filter((c: any) => 
        c.status === 'resolved'
      ).length;
      
      setStats({
        users: usersData.users?.length || 0,
        activeComplaints,
        resolvedComplaints
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.users}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Complaints</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.activeComplaints}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Resolved Complaints</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolvedComplaints}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.href = '/dashboard/users'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Manage Users
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/complaints'}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            View All Complaints
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/profile'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}