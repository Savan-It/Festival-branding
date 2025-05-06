import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function FormPage() {
  const [formData, setFormData] = useState({
    template: 'template4.png',
    company: '',
    message: '',
    contact: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/generate',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate(`/preview/${res.data.image}`);
    } catch (err) {
      alert('Failed to generate image. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Generate Your Festival Branding</h2>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
        <div className="mb-3">
          <label htmlFor="template" className="form-label">Template</label>
          <select
            id="template"
            className="form-select"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
          >
            <option value="template4.png">Template 4</option>
            <option value="template5.png">Template 5</option>
            <option value="template6.png">Template 6</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="company" className="form-label">Company Name</label>
          <input
            type="text"
            id="company"
            className="form-control"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message</label>
          <input
            type="text"
            id="message"
            className="form-control"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contact" className="form-label">Contact</label>
          <input
            type="text"
            id="contact"
            className="form-control"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Generate Image</button>
      </form>
    </div>
  );
}

export default FormPage;