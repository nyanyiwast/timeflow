import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Clock, User, Settings } from 'lucide-react';
import { postData } from '../api/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const storedUserData = sessionStorage.getItem('user');
  const user = storedUserData ? JSON.parse(storedUserData).data : null;

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // Capture image from webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to load
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.width = video.videoWidth;
          video.height = video.videoHeight;
          resolve();
        };
      });

      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      await postData('/check-in', {
        ecNumber: user.ecNumber,
        imageBase64,
      });
      toast.success('Check-in successful!');
    } catch (err) {
      console.error('Check-in error:', err);
      toast.error('Check-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      // Show camera preview modal or directly capture
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to load
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.width = 640;
          video.height = 480;
          resolve();
        };
      });

      // Capture frame after short delay for preview effect
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second preview

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      const response = await postData('/check-out', {
        ecNumber: user.ecNumber,
        imageBase64,
      });
      toast.success(response.message);
    } catch (err) {
      console.error('Check-out error:', err);
      toast.error('Check-out failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            {user ? (
              <>
                <CardTitle className="text-3xl text-center text-green-600">
                  Welcome back, {user.name}
                </CardTitle>
                <div className="space-y-1 text-center">
                  <Badge variant="secondary">EC Number: {user.ecNumber}</Badge>
                  {user.departmentName && <Badge variant="outline">Department: {user.departmentName}</Badge>}
                  {user.departmentId && <Badge variant="default">Dept ID: {user.departmentId}</Badge>}
                </div>

                {/* Profile Picture */}
                <div className="mt-4 text-center">
                  {user.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${user.profilePicture}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-green-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto border-2 border-gray-300">
                      <User className="h-16 w-16 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Full User Info from DB */}
                <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <strong>User Info</strong>
                    <p>Name: {user.name}</p>
                    <p>EC Number: {user.ecNumber}</p>
                    <p>Department: {user.departmentName || 'N/A'}</p>
                    <p>Department ID: {user.departmentId || 'N/A'}</p>
                  </div>
                  {user.faceEncoding && (
                    <div className="bg-blue-50 p-3 rounded">
                      <strong>Face Data</strong>
                      <p>Encoding Available: Yes</p>
                      <p>Size: {atob(user.faceEncoding).length} bytes</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center">
                <CardDescription>No user data found. Please log in.</CardDescription>
                <Button onClick={() => navigate('/login')} className="mt-4">
                  Go to Login
                </Button>
              </div>
            )}
            <CardDescription className="text-center">
              Dashboard for {user.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Check In
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleCheckIn} className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
                      <Camera className="mr-2 h-4 w-4" />
                      Check In Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Check Out
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleCheckOut} className="w-full bg-red-500 hover:bg-red-600" disabled={loading}>
                      <Clock className="mr-2 h-4 w-4" />
                      Check Out Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate('/app/admin')} className="flex-1">
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
              <Button variant="outline" onClick={() => { logout(); navigate('/login'); }} className="flex-1">
                <User className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 p-4 text-center text-sm text-gray-500">
        Developed by Celine
      </footer>
    </div>
  );
};

export default Dashboard;