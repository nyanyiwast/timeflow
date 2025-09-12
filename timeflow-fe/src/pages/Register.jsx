import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { postData } from '../api/api';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    ecNumber: '',
    name: '',
    password: '',
    departmentId: 1, // Default department; can be selected from dropdown
  });
  const [imageBase64, setImageBase64] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.name === 'departmentId' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await postData('/employees/register', {
        ecNumber: formData.ecNumber,
        name: formData.name,
        password: formData.password,
        departmentId: formData.departmentId,
        imageBase64,
      });

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-green-600">
            Register for TimeFlow
          </CardTitle>
          <CardDescription className="text-center">
            Create your account to start tracking time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ecNumber">EC Number</Label>
              <Input
                id="ecNumber"
                name="ecNumber"
                type="text"
                placeholder="Enter EC Number"
                value={formData.ecNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="departmentId">Department ID</Label>
              <Input
                id="departmentId"
                name="departmentId"
                type="number"
                placeholder="Enter department ID"
                value={formData.departmentId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Facial Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImageBase64(reader.result);
                      setPreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImageBase64('');
                    setPreview('');
                  }
                }}
              />
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded" />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="link" onClick={() => navigate('/login')}>
            Already have an account? Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;