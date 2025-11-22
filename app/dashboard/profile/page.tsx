// app/dashboard/profile/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building, BookOpen, MapPin, Briefcase, GraduationCap, Edit, Save, X, LogOut } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

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
        setFormData(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">User not found</h3>
                  <p className="text-muted-foreground">Please log in to access your profile</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal information and account settings</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setEditing(!editing)}
                variant={editing ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                {editing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Basic Information Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Enter your full name"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted/30 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Enter your phone number"
                        className="bg-background/50 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collegeId" className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        College ID
                      </Label>
                      <Input
                        id="collegeId"
                        value={user.collegeId}
                        disabled
                        className="bg-muted/30 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        Department
                      </Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Enter your department"
                        className="bg-background/50 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="role"
                          value={user.role}
                          disabled
                          className="bg-muted/30 border-border/50"
                        />
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role-Specific Information */}
              {user.role === 'student' && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Student Information
                    </CardTitle>
                    <CardDescription>
                      Your academic details and student information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="semester" className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          Semester
                        </Label>
                        <Input
                          id="semester"
                          name="semester"
                          value={formData.semester || ''}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your semester"
                          className="bg-background/50 border-border/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rollNumber" className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          Roll Number
                        </Label>
                        <Input
                          id="rollNumber"
                          name="rollNumber"
                          value={formData.rollNumber || ''}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your roll number"
                          className="bg-background/50 border-border/50"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your complete address"
                          rows={3}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {user.role === 'staff' && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Staff Information
                    </CardTitle>
                    <CardDescription>
                      Your professional details and staff information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="designation" className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          Designation
                        </Label>
                        <Input
                          id="designation"
                          name="designation"
                          value={formData.designation || ''}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your designation"
                          className="bg-background/50 border-border/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialization" className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          Specialization
                        </Label>
                        <Input
                          id="specialization"
                          name="specialization"
                          value={formData.specialization || ''}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your specialization"
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Password Change Section */}
              {editing && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your account password for enhanced security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password || ''}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Leave password fields empty if you don't want to change your password.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {editing && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </form>

          {/* Profile Summary (Read-only view when not editing) */}
          {!editing && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Summary
                </CardTitle>
                <CardDescription>
                  Quick overview of your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background/20">
                    <User className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background/20">
                    <Mail className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background/20">
                    <Building className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.collegeId}</p>
                      <p className="text-xs text-muted-foreground">College ID</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background/20">
                      <Phone className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.phone}</p>
                        <p className="text-xs text-muted-foreground">Phone</p>
                      </div>
                    </div>
                  )}

                  {user.department && (
                    <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background/20">
                      <Building className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.department}</p>
                        <p className="text-xs text-muted-foreground">Department</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background/20">
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{user.role}</p>
                      <p className="text-xs text-muted-foreground">Role</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}