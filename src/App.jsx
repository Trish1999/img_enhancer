import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import './App.css'; // Create an App.css for the responsive styles

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [imageDownloaded, setImageDownloaded] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setImageDownloaded(false);  // Reset after image change
      setEnhancedImage(null); // Reset enhanced image
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Enhance image by adjusting brightness
  const enhanceImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = selectedImage;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw original image on canvas
      ctx.drawImage(image, 0, 0);

      // Apply brightness enhancement
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * 1.1; // Red - increase brightness
        data[i + 1] = data[i + 1] * 1.1; // Green - increase brightness
        data[i + 2] = data[i + 2] * 1.1; // Blue - increase brightness
      }
      // Put the enhanced data back into the canvas
      ctx.putImageData(imageData, 0, 0);

      // Set the enhanced image
      setEnhancedImage(canvas.toDataURL('image/jpeg'));
    };
  };

  // Download enhanced image
  const downloadImage = () => {
    if (enhancedImage) {
      saveAs(enhancedImage, 'enhanced-image.jpg');
      setImageDownloaded(true); // Mark that the image has been downloaded
    }
  };

  // Reset the application to upload a new image
  const resetImageUpload = () => {
    setSelectedImage(null);
    setEnhancedImage(null);
    setImageDownloaded(false);
  };

  return (
    <div className="app-container">
      <h1 style={{ color: 'white', fontSize: '50px' }}>Image Enhancer</h1>

      {!selectedImage && (
        <input type="file" onChange={handleImageUpload} accept="image/*" className="upload-input" />
      )}

      <div className="image-container">
        {selectedImage && (
          <div className="image-box">
            <h3>Original Image</h3>
            <img src={selectedImage} alt="Original" className="image-preview" />
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

        {enhancedImage && (
          <div className="image-box">
            <h3>Enhanced Image</h3>
            <img src={enhancedImage} alt="Enhanced" className="image-preview" />
          </div>
        )}
      </div>

      {selectedImage && !enhancedImage && (
        <button onClick={enhanceImage} className="action-button">Enhance Image</button>
      )}

      {enhancedImage && !imageDownloaded && (
        <button onClick={downloadImage} className="action-button">Download Enhanced Image</button>
      )}

      {imageDownloaded && (
        <button onClick={resetImageUpload} className="action-button">Upload Another Image</button>
      )}
    </div>
  );
};

export default App;
