// --- Backend API Service Functions ---
const BACKEND_API_BASE_URL = 'http://localhost:8000/api';

export const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BACKEND_API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
};

export const loginUser = async (email: string, password: string): Promise<{ user: any; token: string }> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return response.json();
};

export const registerUser = async (name: string, email: string, password: string, password_confirmation: string): Promise<{ user: any; token: string }> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    if (!response.ok) {
        throw new Error('Registration failed');
    }
    return response.json();
};

export const logoutUser = async (): Promise<void> => {
    await apiRequest('/logout', { method: 'POST' });
};

export const getCurrentUser = async (): Promise<any> => {
    return apiRequest('/user');
};

export const getFavorites = async (): Promise<any[]> => {
    return apiRequest('/favorites');
};

export const addFavorite = async (hadith_id: string, book_id: string, hadith_number: number): Promise<any> => {
    return apiRequest('/favorites', {
        method: 'POST',
        body: JSON.stringify({ hadith_id, book_id, hadith_number }),
    });
};

export const removeFavorite = async (hadith_id: string): Promise<void> => {
    await apiRequest(`/favorites/${hadith_id}`, { method: 'DELETE' });
};

// --- Admin User Management API Functions ---
export const getAllUsers = async (): Promise<any[]> => {
    const users = await apiRequest('/admin/users');
    return users.map((user: any) => ({ ...user, username: user.name, name: undefined, createdAt: user.created_at }));
};

export const createUser = async (userData: { username: string; email: string; passwordHash: string; role: string }): Promise<{ success: boolean; message: string; user?: any }> => {
    try {
        const response = await apiRequest('/admin/users', {
            method: 'POST',
            body: JSON.stringify({
                name: userData.username,
                email: userData.email,
                password: userData.passwordHash,
                role: userData.role,
            }),
        });
        return { success: true, message: 'User created successfully', user: { ...response, username: response.name, name: undefined, createdAt: response.created_at } };
    } catch (error) {
        return { success: false, message: 'Failed to create user' };
    }
};

export const updateUser = async (userId: number, userData: Partial<{ username: string; email: string; passwordHash: string; role: string }>): Promise<{ success: boolean; message: string }> => {
    try {
        const updateData: any = {};
        if (userData.username) updateData.name = userData.username;
        if (userData.email) updateData.email = userData.email;
        if (userData.passwordHash) updateData.password = userData.passwordHash;
        if (userData.role) updateData.role = userData.role;

        const response = await apiRequest(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return { success: true, message: 'User updated successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to update user' };
    }
};

export const deleteUser = async (userId: number): Promise<{ success: boolean; message: string }> => {
    try {
        await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to delete user' };
    }
};

export const exportUsersCsv = async (): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${BACKEND_API_BASE_URL}/admin/users/export`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to export users');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
