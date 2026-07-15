import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/services/auth";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.authenticated) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      // The logout function already redirects, but just in case:
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload even if logout fails
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Button 
        onClick={() => authAPI.login()} 
        variant="outline"
        className="bg-white hover:bg-gray-50"
      >
        Sign In to Save Permanently
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.avatar_url && (
        <img
          src={user.avatar_url}
          alt={user.name || user.email}
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">
          {user.name || user.email}
        </span>
        <span className="text-xs text-gray-500">{user.email}</span>
      </div>
      <Button
        onClick={handleLogout}
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-900"
      >
        Logout
      </Button>
    </div>
  );
}

