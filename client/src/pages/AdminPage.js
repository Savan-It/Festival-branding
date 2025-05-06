import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function AdminPage() {
  const [templateData, setTemplateData] = useState({ name: '', dimensions: { message: '', company: '', contact: '' } });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', templateData.name);
    formData.append('dimensions', JSON.stringify(templateData.dimensions));
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/templates', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('Template added successfully');
    } catch (err) {
      alert('Failed to add template');
    }
  };

  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Admin - Add New Template</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Template Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter template name"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Template File</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Message Position (x, y)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., 10, 10"
              value={templateData.dimensions.message}
              onChange={(e) =>
                setTemplateData({ ...templateData, dimensions: { ...templateData.dimensions, message: e.target.value } })
              }
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Company Position (x, y)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., 10, 200"
              value={templateData.dimensions.company}
              onChange={(e) =>
                setTemplateData({ ...templateData, dimensions: { ...templateData.dimensions, company: e.target.value } })
              }
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Contact Position (x, y)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., 10, 260"
              value={templateData.dimensions.contact}
              onChange={(e) =>
                setTemplateData({ ...templateData, dimensions: { ...templateData.dimensions, contact: e.target.value } })
              }
              required
            />
          </div>
          <button type="submit" className="btn btn-custom w-100">Add Template</button>
        </form>
      </div>
    </div>
  );
}

export default AdminPage;