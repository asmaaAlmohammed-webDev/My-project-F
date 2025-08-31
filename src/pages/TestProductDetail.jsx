import React from 'react';
import { useParams } from 'react-router-dom';

const TestProductDetail = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🎯 Test Product Detail Page</h1>
      <p>Product ID: {id}</p>
      <p>This is a test to check if the route works!</p>
    </div>
  );
};

export default TestProductDetail;
