export function getProfilePicturePath(userId: string): string {
   return `${getProfileUploadsDir()}/${computeUserPictureName(userId)}`;
}

export function computeUserPictureName(userId: string): string {
   return `${userId}.jpg`;
}

export function getProfileUploadsDir(): string {
   return `${getRootImagesUploadsDir()}/profile`;
}

export function getRootImagesUploadsDir(): string {
   return `${getRootAssetsDir()}/images`;
}

export function getRootAssetsDir(): string {
   return `${__dirname}/../uploads`;
}
