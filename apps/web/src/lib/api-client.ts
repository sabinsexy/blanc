// API client for REST endpoints
class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  user = {
    getCurrent: () => this.request<User>('/user'),
  };

  // Email endpoints
  emails = {
    list: (params?: { folderId?: string; limit?: number; offset?: number; query?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.folderId) searchParams.set('folderId', params.folderId);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());
      if (params?.query) searchParams.set('query', params.query);
      
      const query = searchParams.toString();
      return this.request<Email[]>(`/emails${query ? `?${query}` : ''}`);
    },

    get: (id: string) => this.request<Email>(`/emails/${id}`),

    create: (data: CreateEmailData) => 
      this.request<Email>('/emails', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateEmailData) =>
      this.request<Email>(`/emails/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<{ success: boolean }>(`/emails/${id}`, {
        method: 'DELETE',
      }),
  };

  // Folder endpoints
  folders = {
    list: () => this.request<Folder[]>('/folders'),

    create: (data: CreateFolderData) =>
      this.request<Folder>('/folders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateFolderData) =>
      this.request<Folder>(`/folders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<{ success: boolean }>(`/folders/${id}`, {
        method: 'DELETE',
      }),
  };
}

export const apiClient = new ApiClient();

// Types
export interface User {
  id: string;
  walletAddress: string;
  publicKey?: string;
  signingPublicKey?: string;
  name?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  aliases: Alias[];
  folders: Folder[];
}

export interface Email {
  id: string;
  userId: string;
  encryptedData: string;
  encryptedSessionKey: string;
  r2BlobKey?: string;
  threadId?: string;
  timestamp: string;
  size: number;
  isRead: boolean;
  isStarred: boolean;
  folderId?: string;
  folder?: Folder;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  emailId: string;
  encryptedMetadata: string;
  r2BlobKey: string;
  size: number;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  type: string;
  color?: string;
  sortOrder: number;
  emailCount: number;
}

export interface Alias {
  id: string;
  userId: string;
  address: string;
  displayName?: string;
  isDefault: boolean;
  encryptedKeys?: string;
}

export interface CreateEmailData {
  encryptedData: string;
  encryptedSessionKeys: Record<string, string>;
  r2BlobKey?: string;
  threadId?: string;
  attachments?: Array<{
    encryptedMetadata: string;
    r2BlobKey: string;
    size: number;
  }>;
}

export interface UpdateEmailData {
  isRead?: boolean;
  isStarred?: boolean;
  folderId?: string;
}

export interface CreateFolderData {
  name: string;
  color?: string;
}

export interface UpdateFolderData {
  name?: string;
  color?: string;
}