const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface CreateCommitmentRequest {
  taskName: string;
  location: {
    lat: number;
    lng: number;
  };
  timeWindow: {
    start: string;
    end: string;
  };
}

export interface CreateCommitmentResponse {
  commitmentId: string;
  status: string;
  data: {
    commitmentId: string;
    taskName: string;
    location: {
      lat: number;
      lng: number;
    };
    timeWindow: {
      start: string;
      end: string;
    };
    status: string;
    createdAt: string;
  };
}

/**
 * Creates a commitment via the backend API
 */
export const createCommitment = async (
  data: CreateCommitmentRequest
): Promise<CreateCommitmentResponse> => {
  const timestamp = new Date().toISOString();
  
  // Log API call
  console.log(`[${timestamp}] API Call: POST ${API_BASE_URL}/commit`);
  console.log('Request payload:', JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/commit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Log successful response
    console.log(`[${new Date().toISOString()}] API Response: Success`);
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Call Failed:`, error);
    throw error;
  }
};

export interface ExecuteTaskRequest {
  commitmentId: string;
  executionLocation: {
    lat: number;
    lng: number;
  };
  executionTime: string;
  evidenceFileHash?: string;
}

export interface ExecuteTaskResponse {
  poeHash: string;
  status: string;
  data: {
    poeHash: string;
    commitmentId: string;
    executionLocation: {
      lat: number;
      lng: number;
    };
    executionTime: string;
    status: string;
    createdAt: string;
    blockchainTx?: string;
  };
}

/**
 * Executes a task via the backend API
 */
export const executeTask = async (
  data: ExecuteTaskRequest
): Promise<ExecuteTaskResponse> => {
  const timestamp = new Date().toISOString();
  
  // Log API call
  console.log(`[${timestamp}] API Call: POST ${API_BASE_URL}/execute`);
  console.log('Request payload:', JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Log successful response
    console.log(`[${new Date().toISOString()}] API Response: Success`);
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Call Failed:`, error);
    throw error;
  }
};

/**
 * Hashes a file using SHA-256
 */
export const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Hashes multiple files and combines them
 */
export const hashFiles = async (files: File[]): Promise<string> => {
  if (files.length === 0) {
    return '';
  }
  
  const hashes = await Promise.all(files.map(file => hashFile(file)));
  const combined = hashes.join('');
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(combined));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export interface Commitment {
  commitmentId: string;
  taskName: string;
  location: {
    lat: number;
    lng: number;
  };
  timeWindow: {
    start: string;
    end: string;
  };
  status: string;
  createdAt: string;
}

/**
 * Gets all commitments from the backend API
 */
export const getAllCommitments = async (): Promise<Commitment[]> => {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] API Call: GET ${API_BASE_URL}/commitments`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/commitments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    console.log(`[${new Date().toISOString()}] API Response: Success (${responseData.length} commitments)`);
    console.log('Commitments:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Call Failed:`, error);
    throw error;
  }
};

/**
 * Gets a single commitment by ID from the backend API
 */
export const getCommitmentById = async (commitmentId: string): Promise<Commitment> => {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] API Call: GET ${API_BASE_URL}/commitments/${commitmentId}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/commitments/${commitmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    console.log(`[${new Date().toISOString()}] API Response: Success`);
    console.log('Commitment:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Call Failed:`, error);
    throw error;
  }
};

export interface Proof {
  poeHash: string;
  commitmentId: string;
  executionLocation: {
    lat: number;
    lng: number;
  };
  executionTime: string;
  status: string;
  createdAt: string;
  blockchainTx?: string;
}

/**
 * Gets a proof by poeHash from the backend API
 */
export const getProofByHash = async (poeHash: string): Promise<Proof> => {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] API Call: GET ${API_BASE_URL}/proofs/${poeHash}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/proofs/${poeHash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    console.log(`[${new Date().toISOString()}] API Response: Success`);
    console.log('Proof:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Call Failed:`, error);
    throw error;
  }
};

/**
 * Gets all proofs from the backend API
 */
export const getAllProofs = async (): Promise<Proof[]> => {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] API Call: GET ${API_BASE_URL}/proofs`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/proofs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    console.log(`[${new Date().toISOString()}] API Response: Success (${responseData.length} proofs)`);
    console.log('Proofs:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Call Failed:`, error);
    throw error;
  }
};

// Explicit type re-export for compatibility
export type { Proof };

export interface VerifyProofResponse {
  valid: boolean;
  reason?: string;
  checks?: {
    hashMatch: boolean;
    onChainMatch: boolean;
    time: boolean;
    location: boolean;
  };
}

/**
 * Verifies a proof by poeHash via the backend API
 */
export const verifyProof = async (poeHash: string): Promise<VerifyProofResponse> => {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] API Call: GET ${API_BASE_URL}/verify?poeHash=${poeHash}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/verify?poeHash=${encodeURIComponent(poeHash)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    console.log(`[${new Date().toISOString()}] API Response: Success`);
    console.log('Verification result:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Call Failed:`, error);
    throw error;
  }
};

