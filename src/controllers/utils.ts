export function getProfilePicturePath(userId: string): string {
   return `${getProfileUploadsDir()}/${computePictureName(userId)}`;
}

export function getProfileUploadsDir(): string {
   return `${getRootImagesUploadsDir()}/profile`;
}

export function getRootImagesUploadsDir(): string {
   return `${getRootAssetsDir()}/images`;
}

export function getAttachmentPath(attachmentId: string): string {
   return `${getRootAttachmentsUploadsDir()}/${computePictureName(attachmentId)}`;
}

export function getRootAttachmentsUploadsDir(): string {
   return `${getRootAssetsDir()}/attachment`;
}

export function getRootAssetsDir(): string {
   return `${__dirname}/../uploads`;
}

export function computePictureName(name: string): string {
   return `${name}.jpg`;
}
