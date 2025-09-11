import React from 'react';

const Admin = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Welcome to the Admin Dashboard. This is a protected route.</p>
      </div>
    </div>
  );
};

export default Admin;
