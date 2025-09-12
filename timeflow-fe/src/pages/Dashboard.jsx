import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Clock, User, Settings } from 'lucide-react';
import { postData } from '../api/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      await postData('/check-out', {
        ecNumber: user.ecNumber,
        imageBase64,
      });
      toast.success('Check-out successful!');
    } catch (err) {
      console.error('Check-out error:', err);
      toast.error('Check-out failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl text-center text-green-600">
              Welcome back, {user.name}
            </CardTitle>
            <CardDescription className="text-center">
              Dashboard for {user.ecNumber}
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
              <Button variant="outline" onClick={logout} className="flex-1">
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