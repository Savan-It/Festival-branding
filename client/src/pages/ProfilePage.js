import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function ProfilePage() {
  const [profile, setProfile] = useState({ company: '', address: '', contact: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put('http://localhost:5000/api/auth/profile', profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Company Name</label>
            <input
              type="text"
              className="form-control"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Address</label>
            <input
              type="text"
              className="form-control"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Contact</label>
            <input
              type="text"
              className="form-control"
              value={profile.contact}
              onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Update Profile</button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;