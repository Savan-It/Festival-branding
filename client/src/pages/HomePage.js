import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function HomePage() {
  const [formData, setFormData] = useState({ template: '', company: '', address: '', contact: '' });
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

  const handleTemplateSelect = (filename) => {
    setFormData({ ...formData, template: filename });
  };

  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Generate Festival Branding</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Choose a Template</label>
            <div className="d-flex flex-wrap">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-thumbnail m-2 ${formData.template === template.filename ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template.filename)}
                  style={{
                    border: formData.template === template.filename ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    padding: '5px',
                  }}
                >
                  <img
                    src={`http://localhost:5000/templates/${template.filename}`}
                    alt={template.name}
                    className="img-thumbnail"
                    style={{ width: '250px', height: 'auto', objectFit: 'cover' }}
                  />
                  <p className="text-center mt-2" style={{ fontSize: '0.9rem' }}>{template.name}</p>
                </div>
              ))}
            </div>
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
            <label>Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
            <img src={outputImage} alt="Generated" className="img-fluid mb-3" />
            <a
              href={outputImage}
              download="generated_image.png"
              className="btn btn-success"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
