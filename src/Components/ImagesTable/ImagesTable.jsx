import React, { useState } from "react";
import { Eye } from "lucide-react";
import { formatDate } from "../../Utils/formatDate";
import ImageViewerModal from "./ViewsModal";

const ExpandedImagesTable = ({ images }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const openViewer = (image) => {
    setCurrentImage(image);
    setCurrentViewIndex(0);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setCurrentImage(null);
    setCurrentViewIndex(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <>
      <ImageViewerModal
        viewerOpen={viewerOpen}
        currentImage={currentImage}
        currentViewIndex={currentViewIndex}
        setCurrentViewIndex={setCurrentViewIndex}
        closeViewer={closeViewer}
      />
      <tr>
        <td colSpan="5" className="px-0 py-0">
          <div className="bg-gray-50 border-t border-gray-100">
            <div className="px-6 py-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {images.map((image) => (
                      <tr key={image._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-3">
                              <img
                                src={image.imageUrl}
                                alt="Fashion item"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {image._id.slice(-8)}...
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {image._id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex px-2 py-1 text-xs font-semibold rounded-full " +
                              getStatusColor(image.status)
                            }
                          >
                            {image.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(image.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openViewer(image);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View All
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default ExpandedImagesTable;
