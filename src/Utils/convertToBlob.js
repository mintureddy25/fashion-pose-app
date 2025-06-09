export const toBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};
