import { useState } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import FashionBatchTable from "./features/Batches/ViewBatches";
import ImageUploader from "./features/Single/Upload";
import TabSwitcher from "./Components/TabSwitcher";
import BatchUpload from "./features/Batches/Upload";

function App() {

   const tabs = [
    { label: "Single Image Upload", content: <ImageUploader /> },
    { label: "Batch Upload", content: <BatchUpload /> },
  ];

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition:Bounce
        style={{ zIndex: 9999 }}
      />
      <TabSwitcher tabs={tabs} />
    </>
  );
}

export default App;
