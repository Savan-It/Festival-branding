import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Draggable from 'react-draggable';

function AdminPage() {
  const [templates, setTemplates] = useState([]);
  const [templateData, setTemplateData] = useState({
    name: '',
    dimensions: { address: '0,0', company: '0,0', contact: '0,0' },
    font: '',
    color: '#000000',
  });
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const nodeRef = React.useRef(null);
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
        await axios.put(`http://localhost:5000/api/templates/${editingTemplateId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        alert('Template updated successfully');
      } else {
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
      dimensions: { address: '0,0', company: '0,0', contact: '0,0' },
      font: '',
      color: '#000000',
    });
    setFile(null);
    setPreviewImage(null);
    setEditingTemplateId(null);
    setShowForm(false);
  };

  const getFieldPosition = (field) => {
    const coords = templateData.dimensions[field]?.split(',') || ['0', '0'];
    return {
      x: parseInt(coords[0], 10) || 0,
      y: parseInt(coords[1], 10) || 0,
    };
  };

  const updateFieldPosition = (field, x, y) => {
    setTemplateData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: `${x},${Math.abs(y)}`,
      },
    }));
  };

  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Admin - Manage Templates</h2>

        {!showForm && (
          <button className="btn btn-primary mb-4" onClick={() => setShowForm(true)}>
            Add Template
          </button>
        )}

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
                required={!editingTemplateId}
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
                <h5>Drag the fields to set their positions</h5>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="img-fluid border"
                    style={{ maxWidth: '100%' }}
                  />
                  {['address', 'company', 'contact'].map((field) => {
                    const position = getFieldPosition(field);
                    return (
                      <Draggable
                        nodeRef={nodeRef}
                        key={field}
                        position={{ x: position.x, y: position.y }}
                        onDrag={(e, data) => updateFieldPosition(field, data.x, data.y)}
                      >
                        <div
                        ref={nodeRef}
                          style={{
                            position: 'absolute',
                            padding: '5px 10px',
                            backgroundColor: templateData.color,
                            color: '#fff',
                            fontFamily: templateData.font,
                            borderRadius: '4px',
                            cursor: 'move',
                            userSelect: 'none',
                            zIndex: 10,
                          }}
                        >
                          {field.toUpperCase()}
                        </div>
                      </Draggable>
                    );
                  })}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-success w-100 mt-4">
              {editingTemplateId ? 'Update Template' : 'Add Template'}
            </button>
            <button type="button" className="btn btn-secondary w-100 mt-2" onClick={resetForm}>
              Cancel
            </button>
          </form>
        )}

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
                      <button className="btn btn-primary me-2" onClick={() => handleEdit(template)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(template.id)}>
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