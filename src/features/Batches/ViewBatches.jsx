import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Calendar,
  Image,
  X,
  ChevronLeft,
} from "lucide-react";
import { useEffect } from "react";
import { getBatches } from "../../services/batch";
import useApi from "../../Utils/useApi";
import ExpandedImagesTable from "../../Components/ImagesTable/ImagesTable";
import Loader from "../../Components/Loader";

const FashionBatchTable = (trigger) => {
  const [expandedBatches, setExpandedBatches] = useState(new Set());
  const { data: batchData, loading, error, refetch } = useApi(getBatches);


//   useEffect(() => {
//   const interval = setInterval(() => {
//     // Only refetch if any batch has status "pending"
//     if (batchData?.some(batch => batch.status === "pending")) {
//       refetch();
//     }
//   }, 2000);

//   return () => clearInterval(interval); // cleanup on unmount
// }, []);


  useEffect(() => {
    refetch();
  }, [trigger]);



  const toggleBatch = (batchId) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);
    }
    setExpandedBatches(newExpanded);
  };

  const formatBatchDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recent Batches of Uploaded Images
          </h1>
          <p className="text-gray-600">
            View your image processing batches
          </p>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batchData.map((batch) => (
                  <React.Fragment key={batch._id}>
                    {/* Batch Row */}
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleBatch(batch._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedBatches.has(batch._id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 mr-3" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 mr-3" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {batch._id.slice(-8)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {batch._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Image className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {batch.totalImages}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (batch.processedImages / batch.totalImages) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {batch.processedImages}/{batch.totalImages}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatBatchDate(batch.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          {expandedBatches.has(batch._id)
                            ? "Collapse"
                            : "Expand"}
                        </button>
                      </td>
                    </tr>

                    {expandedBatches.has(batch._id) && (
                      <ExpandedImagesTable images={batch.images} />
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionBatchTable;
