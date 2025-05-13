import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function HomePage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [outputImage, setOutputImage] = useState(null);

  useEffect(() => {
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
      const res = await axios.post(
        'http://localhost:5000/api/generate',
        { template: selectedTemplate }, // Only send the selected template
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
            <label>Choose a Template</label>
            <div className="d-flex flex-wrap">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-thumbnail m-2 ${selectedTemplate === template.filename ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.filename)}
                  style={{
                    border: selectedTemplate === template.filename ? '2px solid #007bff' : '1px solid #ccc',
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
          <button type="submit" className="btn btn-custom w-100" disabled={!selectedTemplate}>
            Generate
          </button>
        </form>

        {outputImage && (
          <div className="mt-4 text-center">
            <h4>Generated Image</h4>
            <img src={outputImage} alt="Generated" className="img-fluid mb-3" />
            <a
              href={outputImage}
              className="btn btn-success"
              download
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
