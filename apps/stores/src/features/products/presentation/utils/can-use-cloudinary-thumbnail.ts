export function canUseCloudinaryThumbnail(publicId?: string) {
  const normalizedPublicId = publicId?.trim();

  return (
    !!normalizedPublicId &&
    !normalizedPublicId.startsWith('mock') &&
    !normalizedPublicId.startsWith('https://placehold.co/')
  );
}
