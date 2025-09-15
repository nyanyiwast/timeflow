import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { postData, getData } from '../api/api';
import { toast } from 'sonner';
import { Users, BarChart3, Building, Plus, User, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    ecNumber: '',
    name: '',
    password: '',
    departmentId: '',
    role: 'employee'
  });
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      loadDepartments();
      loadEmployees();
    }
  }, [loading, isAdmin]);

  const loadDepartments = async () => {
    try {
      const data = await getData('/departments');
      setDepartments(data.departments || data);
    } catch (err) { // eslint-disable-line no-unused-vars
      toast.error('Failed to load departments');
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getData('/employees');
      setEmployees(data.employees || data);
    } catch (err) { // eslint-disable-line no-unused-vars
      toast.error('Failed to load employees');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    try {
      await postData('/departments', { name: newDepartment });
      toast.success('Department added successfully');
      setNewDepartment('');
      loadDepartments();
    } catch (err) { // eslint-disable-line no-unused-vars
      toast.error('Failed to add department');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    try {
      await postData('/employees/admin', newEmployee);
      toast.success('Employee added successfully');
      setNewEmployee({ ecNumber: '', name: '', password: '', departmentId: '', role: 'employee' });
      loadEmployees();
    } catch (err) { // eslint-disable-line no-unused-vars
      toast.error('Failed to add employee');
    } finally {
      setOperationLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/app');
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-600">Manage departments, employees, and reports</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Admin: {user.name}</Badge>
            <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building className="mr-2 h-4 w-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="employees">
              <Users className="mr-2 h-4 w-4" />
              Employees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Overview of system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{employees.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Departments</CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{departments.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generate attendance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button variant="outline">Generate Daily Report</Button>
                  <Button variant="outline">Generate Monthly Report</Button>
                  <Button variant="outline">Export to CSV</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Add New Department</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Department name"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                      />
                      <Button onClick={handleAddDepartment} disabled={operationLoading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Existing Departments</h3>
                    <div className="space-y-2">
                      {departments.map((dept) => (
                        <div key={dept.id} className="flex justify-between items-center p-3 border rounded">
                          <span>{dept.name}</span>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employees</CardTitle>
                <CardDescription>Manage employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Add New Employee</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="EC Number"
                        value={newEmployee.ecNumber}
                        onChange={(e) => setNewEmployee({...newEmployee, ecNumber: e.target.value})}
                      />
                      <Input
                        placeholder="Name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                      />
                      <Select onValueChange={(value) => setNewEmployee({...newEmployee, departmentId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => setNewEmployee({...newEmployee, role: value})} value={newEmployee.role}>
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <div />
                      <Button onClick={handleAddEmployee} className="md:col-span-2" disabled={operationLoading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Existing Employees</h3>
                    <div className="space-y-2">
                      {employees.map((emp) => (
                        <div key={emp.ecNumber} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <span className="font-medium">{emp.name}</span>
                            <span className="ml-2 text-sm text-gray-500">({emp.ecNumber})</span>
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{emp.departmentName}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={emp.role === 'admin' ? 'default' : 'secondary'}>{emp.role}</Badge>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
