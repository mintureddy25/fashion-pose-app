
import useApi from "../../Utils/useApi";
import { getImages } from "../../services/single";
import ExpandedImagesTable from "../../Components/ImagesTable/ImagesTable";
import Loader from "../../Components/Loader";
import React,{ useEffect } from "react";

function ViewImages({trigger }) {
  const { data: images, loading, error, refetch } = useApi(getImages);



  useEffect(() => {
    refetch();
  }, [trigger]);

  if (loading) {
    return (<Loader />)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recently Processed Images
          </h1>
          <p className="text-gray-600">view your recently processed images</p>
          <ExpandedImagesTable images={images} />
        </div>
      </div>
    </div>
  );
}

export default ViewImages;
