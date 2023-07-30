import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export function upload(file: string, public_id?: string, overwrite?: boolean  ): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> {

}


