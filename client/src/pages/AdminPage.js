import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function AdminPage() {
  const [templateData, setTemplateData] = useState({
    name: '',
    dimensions: { message: '', company: '', contact: '' },
  });
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedField, setSelectedField] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreviewImage(URL.createObjectURL(selectedFile)); // Preview the selected image
  };

  const handleImageClick = (e) => {
    if (!selectedField) {
      alert('Please select a field (Message, Company, or Contact) to set its position.');
      return;
    }

    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left); // X-coordinate relative to the image
    const y = Math.round(e.clientY - rect.top); // Y-coordinate relative to the image

    setTemplateData((prevData) => ({
      ...prevData,
      dimensions: { ...prevData.dimensions, [selectedField]: `${x},${y}` },
    }));
  };

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
              onChange={handleFileChange}
              required
            />
          </div>
          {previewImage && (
            <div className="mt-4 text-center">
              <h5>Click on the image to set positions</h5>
              <img
                src={previewImage}
                alt="Preview"
                className="img-fluid border"
                style={{ maxWidth: '100%', cursor: 'crosshair' }}
                onClick={handleImageClick}
              />
              <div className="mt-3">
                <button
                  type="button"
                  className={`btn btn-outline-primary me-2 ${selectedField === 'message' ? 'active' : ''}`}
                  onClick={() => setSelectedField('message')}
                >
                  Set Message Position
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary me-2 ${selectedField === 'company' ? 'active' : ''}`}
                  onClick={() => setSelectedField('company')}
                >
                  Set Company Position
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${selectedField === 'contact' ? 'active' : ''}`}
                  onClick={() => setSelectedField('contact')}
                >
                  Set Contact Position
                </button>
              </div>
              <div className="mt-3">
                <p><strong>Message Position:</strong> {templateData.dimensions.message || 'Not set'}</p>
                <p><strong>Company Position:</strong> {templateData.dimensions.company || 'Not set'}</p>
                <p><strong>Contact Position:</strong> {templateData.dimensions.contact || 'Not set'}</p>
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-custom w-100 mt-4">Add Template</button>
        </form>
      </div>
    </div>
  );
}

export default AdminPage;