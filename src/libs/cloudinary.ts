import { constructCloudinaryUrl, type ImageOptions } from "@cloudinary-util/url-loader";

export function getCldImageUrl(options: ImageOptions) {
  if (!options.src) return "";

  return constructCloudinaryUrl({
    options,
    config: {
      cloud: { cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME },
      url: {
        secureDistribution: import.meta.env.PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION,
        privateCdn: import.meta.env.PUBLIC_CLOUDINARY_PRIVATE_CDN
      }
    }
  });
}
