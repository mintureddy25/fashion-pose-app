import React, { useState, useRef } from "react";
import { Upload, X, Link, Plus, Trash2 } from "lucide-react";
import { getPresignedUrls } from "../../services/s3";
import { uploadBatchImages } from "../../services/batch";
import { toast } from "react-toastify";
import FashionBatchTable from "./ViewBatches";

const BatchUpload = () => {
  const [images, setImages] = useState([]);
  const [urlInput, setUrlInput] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const fileInputRef = useRef(null);
  const [trigger, setTrigger] = useState(false);

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            src: e.target.result,
            name: file.name,
            type: "file",
            size: file.size,
            fileObject: file,
          };
          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const isValidImageUrl = (url) => {
    try {
      new URL(url); // throws if invalid URL syntax
    } catch {
      return false;
    }
    // Optional: check file extension (jpg, jpeg, png, gif, webp, svg)
    return /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(url);
  };

  const addUrlDirectly = () => {
    const trimmedUrl = urlInput.trim();

    if (!trimmedUrl) return;

    if (!isValidImageUrl(trimmedUrl)) {
      toast.error("Please enter a valid image URL.");
      return;
    }

    const newImage = {
      id: Date.now() + Math.random(),
      src: trimmedUrl,
      name: trimmedUrl.split("/").pop() || "URL Image",
      type: "url",
    };

    setImages((prev) => [...prev, newImage]);
    setUrlInput("");
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleImageSelection = (id) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const removeSelectedImages = () => {
    setImages((prev) => prev.filter((img) => !selectedImages.has(img.id)));
    setSelectedImages(new Set());
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadImages = async () => {
    try {
      // Separate files and URLs
      const filesToUpload = images.filter((img) => img.type === "file");
      const urlImages = images.filter((img) => img.type === "url");

      // If no images, exit early
      if (images.length === 0) {
        toast.error("No images to upload!");
        return;
      }
      

      // Prepare files info for presigned URLs request
      const filesInfo = filesToUpload.map((fileImg) => ({
        fileName: fileImg.name,
        fileType: fileImg.fileObject.type, // use actual file type from File object
      }));

      let uploadedUrls = [];

      if (filesInfo.length > 0) {
        // 1. Get presigned URLs for the files
        const presignedRes = await getPresignedUrls({ files: filesInfo });

        const { urls } = presignedRes;

        await Promise.all(
          urls.map(async (presigned, index) => {
            const fileImage = filesToUpload[index];
            // Use the actual File object directly here:
            await fetch(presigned.presignedUrl, {
              method: "PUT",
              body: fileImage.fileObject,
            });

            uploadedUrls.push(presigned.imageUrl);
          })
        );
      }
      const allImageUrls = [
        ...urlImages.map((img) => img.src),
        ...uploadedUrls,
      ];

      await uploadBatchImages({ imageUrls: allImageUrls });
      

      toast.success(`Successfully uploaded ${allImageUrls.length} images!`);
      setTrigger((prev) => !prev);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload images. Check console for details.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Image Upload Manager
          </h1>
          <p className="text-gray-600">
            Upload files or add URLs to manage your images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Section */}
          <div>
            {/* File Upload Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                File Upload
              </h2>

              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-700 mb-1">
                      {dragActive ? "Drop here!" : "Drag & drop images"}
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </div>

            {/* URL Input Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Link className="w-5 h-5" />
                Add Image URL
              </h2>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    onKeyPress={(e) => e.key === "Enter" && addUrlDirectly()}
                  />
                  <button
                    onClick={addUrlDirectly}
                    disabled={!urlInput.trim()}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Selected Images */}
          <div>
            {images.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    Selected Images ({images.length})
                  </h2>
                  {selectedImages.size > 0 && (
                    <button
                      onClick={removeSelectedImages}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove ({selectedImages.size})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group cursor-pointer transition-all duration-200 ${
                        selectedImages.has(image.id)
                          ? "ring-2 ring-blue-500 ring-offset-1"
                          : "hover:scale-105"
                      }`}
                      onClick={() => toggleImageSelection(image.id)}
                    >
                      <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm border">
                        {image.type === "file" ? (
                          <img
                            src={image.src}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-2">
                            <Link className="w-4 h-4 text-gray-500 mb-1" />
                            <span className="text-xs text-gray-600 text-center truncate w-full">
                              {image.name}
                            </span>
                          </div>
                        )}

                        {/* Selection overlay */}
                        {selectedImages.has(image.id) && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Individual remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Type indicator */}
                      <div className="absolute bottom-1 left-1">
                        <span
                          className={`px-1 py-0.5 text-xs font-medium rounded ${
                            image.type === "file"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {image.type === "file" ? "F" : "U"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Button */}
                <div className="mt-6 text-center">
                  <button
                    onClick={uploadImages}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Upload {images.length} Image{images.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            )}

            {images.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No images selected</p>
                <p className="text-gray-400 text-sm">
                  Upload files or add URLs to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <FashionBatchTable trigger={trigger} />
    </div>
  );
};

export default BatchUpload;
