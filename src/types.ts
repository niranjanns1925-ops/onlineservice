export interface Service {
  id: string;
  name: string;
  description: string;
  procedure: string;
  fee: number;
  requiredDocuments: string[];
}

export interface Application {
  id: string;
  userId: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'processing' | 'info_requested';
  rejectionReason?: string;
  adminNote?: string;
  uploadedDocuments: Record<string, string>;
  additionalDocuments?: Record<string, string>;
  infoRequestedDetails?: string;
  appliedAt: string;
  updatedAt: string;
  estimatedCompletionAt?: string;
}

export interface AdminNotification {
  id: string;
  type: 'new_application' | 'doc_uploaded' | 'payment_received';
  userId: string;
  userName: string;
  applicationId: string;
  serviceName: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}
