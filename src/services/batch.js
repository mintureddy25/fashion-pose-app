import api from "./api";

export async function getBatches() {
  try {
    const res = await api.get('/upload/batches');
    return res.data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
}


export async function uploadBatchImages(data) {
  try {
    const res = await api.post('/upload/batch', data);
    return res.data;
  } catch (error) {
    console.error('Error uploading batch:', error);
    throw error;
  }
}