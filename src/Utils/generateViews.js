import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";

/**
 * Crops a region from the source canvas, resizes it to target dimensions,
 * and returns it as a base64 PNG.
 */
export const cropAndResizeRegion = (
  ctx,
  x,
  y,
  width,
  height,
  targetWidth,
  targetHeight
) => {
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = targetWidth;
  cropCanvas.height = targetHeight;
  const cropCtx = cropCanvas.getContext("2d");

  // Clamp input to prevent cropping outside canvas
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const srcX = clamp(x, 0, ctx.canvas.width);
  const srcY = clamp(y, 0, ctx.canvas.height);
  const srcW = clamp(width, 0, ctx.canvas.width - srcX);
  const srcH = clamp(height, 0, ctx.canvas.height - srcY);

  cropCtx.drawImage(
    ctx.canvas,
    srcX,
    srcY,
    srcW,
    srcH,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return cropCanvas.toDataURL("image/png");
};

/**
 * Detects body parts and generates multiple cropped/resized views from an image.
 */
export const generateViewsFromImage = async (imageElement, canvasElement) => {
  const net = await posenet.load();
  const pose = await net.estimateSinglePose(imageElement);

  const ctx = canvasElement.getContext("2d");
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  ctx.drawImage(imageElement, 0, 0);

  const get = (part) => pose.keypoints.find((kp) => kp.part === part)?.position;

  const nose = get("nose");
  const leftShoulder = get("leftShoulder");
  const rightShoulder = get("rightShoulder");
  const leftHip = get("leftHip");
  const rightHip = get("rightHip");
  const leftKnee = get("leftKnee");
  const rightKnee = get("rightKnee");
  const leftAnkle = get("leftAnkle");
  const rightAnkle = get("rightAnkle");
  const leftElbow = get("leftElbow");
  const rightElbow = get("rightElbow");

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    throw new Error("Essential keypoints not detected.");
  }

  const fullWidth = canvasElement.width;
  const fullHeight = canvasElement.height;

  const views = {};
  views.full = canvasElement.toDataURL("image/png");

  // Neck View
  const neckLeft = Math.min(leftShoulder.x, rightShoulder.x);
  const neckRight = Math.max(leftShoulder.x, rightShoulder.x);
  const neckTop = 0;
  const neckBottom = Math.max(leftShoulder.y, rightShoulder.y);
  views.neck = cropAndResizeRegion(
    ctx,
    neckLeft,
    neckTop,
    neckRight - neckLeft,
    neckBottom - neckTop,
    fullWidth,
    fullHeight
  );

  // Sleeve View
  if (!nose || !leftHip) {
    throw new Error("Additional keypoints for sleeve not detected.");
  }
  const sleeveTop = nose.y;
  const sleeveBottom = leftHip.y;
  const sleeveLeft = nose.x;
  const sleeveWidth = canvasElement.width - sleeveLeft;
  views.sleeve = cropAndResizeRegion(
    ctx,
    sleeveLeft,
    sleeveTop,
    sleeveWidth,
    sleeveBottom - sleeveTop,
    fullWidth,
    fullHeight
  );


if (
  leftShoulder && rightShoulder &&
  leftHip && rightHip &&
  rightKnee && leftKnee
) {
  // Compute new waist box points using averages/midpoints
  const topLeftX = Math.min(rightHip.x, leftHip.x) / 2;
  const topLeftY = (rightShoulder.y + rightHip.y) / 2;

  const topRightX = (leftHip.x + canvasElement.width) / 2;
  const topRightY = topLeftY;

  const bottomLeftX = topLeftX;
  const bottomLeftY = (rightHip.y + rightKnee.y) / 2;

  const bottomRightX = topRightX;
  const bottomRightY = bottomLeftY;

  // Define bounding box based on above coordinates
  const rawLeft = Math.min(topLeftX, bottomLeftX);
  const rawRight = Math.max(topRightX, bottomRightX);
  const rawTop = Math.min(topLeftY, bottomLeftY);
  const rawBottom = Math.max(topRightY, bottomRightY);

  // Clamp and calculate dimensions
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const x = clamp(rawLeft, 0, canvasElement.width);
  const y = clamp(rawTop, 0, canvasElement.height);
  const maxX = clamp(rawRight, 0, canvasElement.width);
  const maxY = clamp(rawBottom, 0, canvasElement.height);

  const width = Math.max(1, maxX - x);
  const height = Math.max(1, maxY - y);

  // Crop and resize
  views.waist = cropAndResizeRegion(
    ctx,
    x,
    y,
    width,
    height,
    fullWidth,
    fullHeight
  );
} else {
  console.warn("Skipping waist view — required keypoints missing.");
}




  // Length View
  if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
    throw new Error("Additional keypoints for length not detected.");
  }

  const lengthTop = Math.max(0, Math.min(leftKnee.y, rightKnee.y) - 30);
  const lengthBottom = Math.min(
    fullHeight,
    Math.max(leftAnkle.y, rightAnkle.y) + 30
  );
  const lengthLeft = Math.max(0, Math.min(leftKnee.x, rightKnee.x) - 60);
  const lengthRight = Math.min(
    fullWidth,
    Math.max(leftKnee.x, rightKnee.x) + 60
  );

  views.length = cropAndResizeRegion(
    ctx,
    lengthLeft,
    lengthTop,
    lengthRight - lengthLeft,
    lengthBottom - lengthTop,
    fullWidth,
    fullHeight
  );

  // Zoomed View (center torso)
  const zoomX = (leftShoulder.x + rightShoulder.x) / 2 - 75;
  const zoomY = (leftShoulder.y + leftHip.y) / 2 - 75;

  views.zoomed = cropAndResizeRegion(
    ctx,
    zoomX,
    zoomY,
    150,
    150,
    fullWidth,
    fullHeight
  );

  return views;
};
