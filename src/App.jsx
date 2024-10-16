import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import './App.css'; // Assuming you have some styles here

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

      // Brightness and Contrast
      const brightnessFactor = 1.1; // Increase brightness
      const contrastFactor = 1; // Increase contrast

      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        data[i] = data[i] * brightnessFactor;     // Red
        data[i + 1] = data[i + 1] * brightnessFactor; // Green
        data[i + 2] = data[i + 2] * brightnessFactor; // Blue

        // Apply contrast
        // Formula: (pixelValue - 128) * contrastFactor + 128
        data[i] = ((data[i] - 128) * contrastFactor) + 128;
        data[i + 1] = ((data[i + 1] - 128) * contrastFactor) + 128;
        data[i + 2] = ((data[i + 2] - 128) * contrastFactor) + 128;

        // Clamp values to 0-255
        data[i] = Math.min(255, Math.max(0, data[i]));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
      }

      // Put the enhanced data back into the canvas
      ctx.putImageData(imageData, 0, 0);
      // Optional: Apply a reduced sharpening effect (using convolution)
      const kernel = [
        [0, -0.5, 0],
        [-0.5, 3, -0.5],
        [0, -0.5, 0]
      ];

      // Using a smaller sharpening kernel for less sharpness
      const sharpenedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const sharpenedData = sharpenedImageData.data;

      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let value = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const pixel = (y + ky) * canvas.width + (x + kx);
                value += data[pixel * 4 + c] * kernel[ky + 1][kx + 1];
              }
            }
            sharpenedData[(y * canvas.width + x) * 4 + c] = Math.min(255, Math.max(0, value));
          }
          sharpenedData[(y * canvas.width + x) * 4 + 3] = 255; // Alpha
        }
      }

      ctx.putImageData(sharpenedImageData, 0, 0);

      // Set the enhanced image as Base64
      const base64Image = canvas.toDataURL('image/jpeg');

      setEnhancedImage(base64Image);
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

      {selectedImage && (
        <button onClick={resetImageUpload} className="action-button">Replace Image</button>
      )}

      {selectedImage && !enhancedImage && (
        <button onClick={enhanceImage} className="action-button">Enhance Image</button>
      )}

      {enhancedImage && !imageDownloaded && (
        <button onClick={downloadImage} className="action-button">Download Enhanced Image</button>
      )}
    </div>
  );
};

export default App;
