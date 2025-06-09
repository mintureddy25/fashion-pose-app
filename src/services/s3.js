import api from "./api";

export async function getPresignedUrls(data) {
  try {
    const res = await api.post('/s3/generate-presigned-urls', data);
    return res.data;
  } catch (error) {
    console.error('Error fetching presigned URLs:', error);
    throw error;
  }
}