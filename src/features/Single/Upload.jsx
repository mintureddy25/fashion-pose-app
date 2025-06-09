import React, { useRef, useState, useEffect } from "react";
import { generateViewsFromImage } from "../../Utils/generateViews";
import { uploadViewsToS3 } from "../../Utils/uploadTos3";
import { Upload, Link, ImageIcon, Check, X } from 'lucide-react';
import { collapseToast, toast, ToastContainer } from "react-toastify";
import ViewImages from "./ViewImages";

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [generatedViews, setGeneratedViews] = useState({});
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [trigger, setTrigger] = useState(false);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewURL(e.target.result);
        setUploadStatus(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = () => {
    if (imageUrlInput.trim()) {
      setIsLoading(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setPreviewURL(imageUrlInput);
        setIsLoading(false);
        setUploadStatus(null);
      };
      img.onerror = () => {
        setIsLoading(false);
        setUploadStatus('error');
        toast.error("Failed to load image. Please check the URL.");
      };
      img.src = imageUrlInput;
    }
  };


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setPreviewURL(null);
    setImageUrlInput('');
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const generateAndUpload = async () => {
    try {
      setIsLoading(true);
      const views = await generateViewsFromImage(
        imageRef.current,
        canvasRef.current
      );
      setGeneratedViews(views);
      await uploadViewsToS3(views);
      setTrigger((prev) => !prev);
      toast.success("Views generated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    }finally {
      setIsLoading(false);
      clearImage();
    }
  };

  const viewTypes = [
    { key: 'full', label: 'Full View' },
    { key: 'neck', label: 'Neckline' },
    { key: 'sleeve', label: 'Sleeves' },
    { key: 'waist', label: 'Waist' },
    { key: 'length', label: 'Length' },
    { key: 'zoomed', label: 'Zoomed' }
  ];

  const prevView = () => {
    setCurrentViewIndex(
      (prev) => (prev - 1 + viewTypes.length) % viewTypes.length
    );
  };

  const nextView = () => {
    setCurrentViewIndex((prev) => (prev + 1) % viewTypes.length);
  };

  useEffect(() => {
    if (previewURL) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        imageRef.current = img;
      };
      // img.onerror = () => {
      //   toast.error("Failed to load image. Please check the URL.");
      // };
      img.src = previewURL;
    }
  }, [previewURL]);

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Image</h2>
        <p className="text-gray-600">Choose a file or enter an image URL to get started</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 mb-6 transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your image here, or <span className="text-blue-600">browse</span>
          </p>
          <p className="text-sm text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
        </div>
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Or enter an image URL
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={handleUrlInput}
            disabled={!imageUrlInput.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Load'
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <X className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Failed to load image. Please check the URL.</span>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-green-700">Image processed successfully!</span>
        </div>
      )}

      {/* Image Preview */}
      {previewURL && (
        <div className="mb-6">
          <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200">
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            <img
              src={previewURL}
              alt="Preview"
              className="w-full max-h-96 object-contain rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      {previewURL && (
        <div className="text-center">
          <button
            onClick={generateAndUpload}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <ImageIcon className="w-6 h-6" />
                Generate & Upload
              </>
            )}
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>

      {Object.keys(generatedViews).length > 0 && (
        <div className="p-6">
          {/* Main View */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <img
                src={generatedViews[viewTypes[currentViewIndex].key]}
                alt={viewTypes[currentViewIndex].label}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = ""; 
                }}
              />

              {/* Arrows */}
              <button
                onClick={prevView}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                &#8592;
              </button>
              <button
                onClick={nextView}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                &#8594;
              </button>
            </div>

            <h4 className="text-xl font-semibold text-gray-900 mt-4">
              {viewTypes[currentViewIndex].label}
            </h4>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {viewTypes.map((viewType, index) => (
              <button
                key={viewType.key}
                onClick={() => setCurrentViewIndex(index)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  currentViewIndex === index
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-25 text-gray-600"
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-md mx-auto mb-2 overflow-hidden">
                    <img
                      src={generatedViews[viewType.key]}
                      alt={viewType.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">{viewType.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <ViewImages trigger={trigger} />
    </div>
  );
};

export default ImageUploader;
