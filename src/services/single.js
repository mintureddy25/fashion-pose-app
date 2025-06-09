import api from "./api";

export async function getImages() {
  try {
    const res = await api.get('/upload/images');
    return res.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

export async function uploadImage(data) {
  try {
    const res = await api.post('/upload/image', data);
    return res.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}