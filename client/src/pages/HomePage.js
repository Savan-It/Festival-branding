import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function HomePage() {
  const [formData, setFormData] = useState({ template: '', company: '', message: '', contact: '' });
  const [templates, setTemplates] = useState([]);
  const [outputImage, setOutputImage] = useState(null);

  useEffect(() => {
    // Fetch available templates from the server
    const fetchTemplates = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/templates');
        setTemplates(res.data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/generate', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOutputImage(`http://localhost:5000/output/${res.data.image}`);
    } catch (err) {
      alert('Failed to generate image');
    }
  };

  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Generate Festival Branding</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Template</label>
            <select
              className="form-control"
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              required
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.filename}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group mb-3">
            <label>Company</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter company name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Message</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Contact</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter contact details"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-custom w-100">Generate</button>
        </form>

        {outputImage && (
          <div className="mt-4 text-center">
            <h4>Generated Image</h4>
            <img src={outputImage} alt="Generated" className="img-fluid" />
            <a href={outputImage} download className="btn btn-success mt-3">Download Image</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
