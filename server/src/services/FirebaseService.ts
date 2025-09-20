import { bucket } from "../config/firebase";
import { logger } from "../utils/logger";

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

class FirebaseService {
  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        folder = "uploads",
        fileName,
        contentType = file.mimetype,
        metadata = {},
      } = options;

      // Generate unique filename if not provided
      const finalFileName = fileName || `${Date.now()}-${file.originalname}`;
      const filePath = `${folder}/${finalFileName}`;

      // Create file reference
      const fileRef = bucket.file(filePath);

      // Upload file
      await fileRef.save(file.buffer, {
        metadata: {
          contentType,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
            ...metadata,
          },
        },
      });

      // Make file publicly accessible
      await fileRef.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      logger.info(`File uploaded successfully: ${filePath}`);

      return {
        success: true,
        url: publicUrl,
        fileName: finalFileName,
      };
    } catch (error: any) {
      logger.error("Firebase upload error:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }

  /**
   * Upload multiple files to Firebase Storage
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(
    filePath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const fileRef = bucket.file(filePath);
      await fileRef.delete();

      logger.info(`File deleted successfully: ${filePath}`);
      return { success: true };
    } catch (error: any) {
      logger.error("Firebase delete error:", error);
      return {
        success: false,
        error: error.message || "Delete failed",
      };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string) {
    try {
      const fileRef = bucket.file(filePath);
      const [metadata] = await fileRef.getMetadata();
      return { success: true, metadata };
    } catch (error: any) {
      logger.error("Firebase metadata error:", error);
      return {
        success: false,
        error: error.message || "Failed to get metadata",
      };
    }
  }

  /**
   * Generate a signed URL for private file access
   */
  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileRef = bucket.file(filePath);
      const [url] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + expiresIn * 1000,
      });

      return { success: true, url };
    } catch (error: any) {
      logger.error("Firebase signed URL error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate signed URL",
      };
    }
  }

  /**
   * Upload course material with specific folder structure
   */
  async uploadCourseMaterial(
    file: Express.Multer.File,
    courseId: number,
    materialType: "document" | "video" | "image" | "other" = "document"
  ): Promise<UploadResult> {
    const folder = `courses/${courseId}/materials/${materialType}`;
    const fileName = `${Date.now()}-${file.originalname}`;

    return this.uploadFile(file, {
      folder,
      fileName,
      metadata: {
        courseId: courseId.toString(),
        materialType,
        uploadedBy: "system", // This should be passed from the request
      },
    });
  }

  /**
   * Upload live class recording
   */
  async uploadLiveClassRecording(
    file: Express.Multer.File,
    courseId: number,
    classId: number
  ): Promise<UploadResult> {
    const folder = `courses/${courseId}/live-classes/${classId}/recordings`;
    const fileName = `recording-${Date.now()}.${file.originalname
      .split(".")
      .pop()}`;

    return this.uploadFile(file, {
      folder,
      fileName,
      contentType: "video/mp4",
      metadata: {
        courseId: courseId.toString(),
        classId: classId.toString(),
        type: "recording",
      },
    });
  }

  /**
   * Upload capstone project files
   */
  async uploadCapstoneProject(
    file: Express.Multer.File,
    courseId: number,
    studentId: number,
    projectPhase: "planning" | "development" | "review" | "presentation"
  ): Promise<UploadResult> {
    const folder = `courses/${courseId}/capstone-projects/${studentId}/${projectPhase}`;
    const fileName = `${projectPhase}-${Date.now()}-${file.originalname}`;

    return this.uploadFile(file, {
      folder,
      fileName,
      metadata: {
        courseId: courseId.toString(),
        studentId: studentId.toString(),
        projectPhase,
      },
    });
  }

  /**
   * Upload CV and career documents
   */
  async uploadCareerDocument(
    file: Express.Multer.File,
    studentId: number,
    documentType: "cv" | "portfolio" | "certificate" | "other"
  ): Promise<UploadResult> {
    const folder = `career-services/${studentId}/${documentType}`;
    const fileName = `${documentType}-${Date.now()}-${file.originalname}`;

    return this.uploadFile(file, {
      folder,
      fileName,
      metadata: {
        studentId: studentId.toString(),
        documentType,
      },
    });
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;











