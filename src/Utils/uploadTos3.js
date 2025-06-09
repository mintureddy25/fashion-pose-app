import { uploadImage } from "../services/single";
import { getPresignedUrls } from "../services/s3";


export const uploadViewsToS3 = async (views) => {
  const entries = Object.entries(views);

  const files = await Promise.all(
    entries.map(async ([viewName, dataUrl]) => {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return {
        viewName,
        file: blob,
        fileName: `${viewName}.png`,
        fileType: blob.type,
      };
    })
  );

  const presignedRes = await getPresignedUrls({
    files: files.map(({ fileName, fileType }) => ({ fileName, fileType })),
  });

  const { urls } = presignedRes;

  await Promise.all(
    urls.map(({ presignedUrl }, index) =>
      fetch(presignedUrl, {
        method: "PUT",
        body: files[index].file,
      })
    )
  );

  const uploadedImageUrls = {};
  urls.forEach(({ imageUrl }, index) => {
    uploadedImageUrls[files[index].viewName] = imageUrl;
  });

  await uploadImage({
    imageUrl: uploadedImageUrls.full,
    views: uploadedImageUrls,
  });

  return uploadedImageUrls;
};
