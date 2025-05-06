import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed. Try again.');
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          className="block my-2 border p-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="block my-2 border p-2 w-full"
        />
        <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2">
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;