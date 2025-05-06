import React from 'react';
import { useParams } from 'react-router-dom';

function PreviewPage() {
  const { imageName } = useParams();
  const imageUrl = `http://localhost:5000/output/${imageName}`;

  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-4">Your Generated Image</h2>
      <div className="mb-4">
        <img
          src={imageUrl}
          alt="Generated"
          className="img-fluid border rounded shadow-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <a
        href={imageUrl}
        download={imageName}
        className="btn btn-success"
      >
        Download Image
      </a>
    </div>
  );
}

export default PreviewPage;