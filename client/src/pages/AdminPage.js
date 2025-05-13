import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function AdminPage() {
  const [templates, setTemplates] = useState([]); // State to store all templates
  const [templateData, setTemplateData] = useState({
    name: '',
    dimensions: { address: '', company: '', contact: '' },
    font: '',
    color: '#000000',
  });
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedField, setSelectedField] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState(null); // Track if editing a template
  const [showForm, setShowForm] = useState(false); // Toggle form visibility

  // Fetch all templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/templates');
      setTemplates(response.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreviewImage(URL.createObjectURL(selectedFile));
  };

  const handleImageClick = (e) => {
    if (!selectedField) {
      alert('Please select a field (address, Company, or Contact) to set its position.');
      return;
    }

    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

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
    formData.append('font', templateData.font);
    formData.append('color', templateData.color);
    if (file) formData.append('file', file);

    try {
      if (editingTemplateId) {
        // Update existing template
        await axios.put(`http://localhost:5000/api/templates/${editingTemplateId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        alert('Template updated successfully');
      } else {
        // Add new template
        await axios.post('http://localhost:5000/api/templates', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        alert('Template added successfully');
      }
      fetchTemplates();
      resetForm();
    } catch (err) {
      alert('Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplateId(template.id);
    setTemplateData({
      name: template.name,
      dimensions: template.dimensions,
      font: template.font,
      color: template.color,
    });
    setPreviewImage(`http://localhost:5000/templates/${template.filename}`);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`http://localhost:5000/api/templates/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Template deleted successfully');
        fetchTemplates();
      } catch (err) {
        alert('Failed to delete template');
      }
    }
  };

  const resetForm = () => {
    setTemplateData({
      name: '',
      dimensions: { address: '', company: '', contact: '' },
      font: '',
      color: '#000000',
    });
    setFile(null);
    setPreviewImage(null);
    setSelectedField('');
    setEditingTemplateId(null);
    setShowForm(false);
  };

  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Admin - Manage Templates</h2>

        {/* Button to toggle form */}
        {!showForm && (
          <button className="btn btn-primary mb-4" onClick={() => setShowForm(true)}>
            Add Template
          </button>
        )}

        {/* Form to Add/Edit Template */}
        {showForm && (
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
                required={!editingTemplateId} // File is required only for new templates
              />
            </div>
            <div className="form-group mb-3">
              <label>Font</label>
              <select
                className="form-control"
                value={templateData.font}
                onChange={(e) => setTemplateData({ ...templateData, font: e.target.value })}
                required
              >
                <option value="">Select Font</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label>Color</label>
              <input
                type="color"
                className="form-control"
                value={templateData.color}
                onChange={(e) => setTemplateData({ ...templateData, color: e.target.value })}
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
                    className={`btn btn-outline-primary me-2 ${selectedField === 'address' ? 'active' : ''}`}
                    onClick={() => setSelectedField('address')}
                  >
                    Set Address Position
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
              </div>
            )}
            <button type="submit" className="btn btn-custom w-100 mt-4">
              {editingTemplateId ? 'Update Template' : 'Add Template'}
            </button>
            <button type="button" className="btn btn-secondary w-100 mt-2" onClick={resetForm}>
              Cancel
            </button>
          </form>
        )}

        {/* List of Templates */}
        {!showForm && (
          <div className="mt-5">
            <h3 className="text-center mb-4">Existing Templates</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Font</th>
                  <th>Color</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.name}</td>
                    <td>{template.font}</td>
                    <td>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: template.color,
                          border: '1px solid #000',
                        }}
                      ></div>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => handleEdit(template)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(template.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;