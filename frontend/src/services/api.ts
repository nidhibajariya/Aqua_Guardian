import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(async (config) => {
    try {
        const session = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
        if (session.data.session?.access_token) {
            config.headers.Authorization = `Bearer ${session.data.session.access_token}`;
            // Remove the manual user_id field if it exists, as the backend now uses the token
            // Note: We don't remove FormData fields here, but we stop successful injection of user_id
        }
    } catch (error) {
        console.error("Error attaching token:", error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});



export const fetchWaterQuality = async () => {
    try {
        const response = await api.get('/dashboard/water-quality');
        return response.data || null;
    } catch (error) {
        console.error('Error fetching water quality:', error);
        return null;
    }
};

export const fetchMarineImpact = async () => {
    try {
        const response = await api.get('/dashboard/marine-impact');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching marine impact:', error);
        return [];
    }
};

export const fetchSuccessStories = async () => {
    try {
        const response = await api.get('/dashboard/success-stories');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching success stories:', error);
        return [];
    }
};

export const fetchWaterQualityHistory = async (limit: number = 20) => {
    try {
        const response = await api.get(`/dashboard/water-quality-history?limit=${limit}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching water quality history:', error);
        return [];
    }
};

export const fetchDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data || {
            total_reports: 0,
            active_users: 0,
            resolved_reports: 0,
            avg_response_time: null
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            total_reports: 0,
            active_users: 0,
            resolved_reports: 0,
            avg_response_time: null
        };
    }
};

export const fetchReportsTimeline = async (days: number = 30) => {
    try {
        const response = await api.get(`/dashboard/reports/timeline?days=${days}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching reports timeline:', error);
        return [];
    }
};

export const fetchReportsByType = async () => {
    try {
        const response = await api.get('/dashboard/reports/by-type');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching reports by type:', error);
        return [];
    }
};

export const fetchReportsByStatus = async () => {
    try {
        const response = await api.get('/dashboard/reports/by-status');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching reports by status:', error);
        return [];
    }
};

export const fetchGeographicHeatmap = async () => {
    try {
        const response = await api.get('/dashboard/reports/geographic-heatmap');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching geographic heatmap:', error);
        return [];
    }
};

export const fetchSeverityDistribution = async () => {
    try {
        const response = await api.get('/dashboard/reports/severity-distribution');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching severity distribution:', error);
        return [];
    }
};

export const fetchTrendComparison = async (months: number = 6) => {
    try {
        const response = await api.get(`/dashboard/reports/trend-comparison?months=${months}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching trend comparison:', error);
        return [];
    }
};

export const fetchMarineImpactMetrics = async () => {
    try {
        const response = await api.get('/dashboard/marine-impact/metrics');
        return response.data || {
            species_impact: [],
            pollution_sources: [],
            ecosystem_health: {},
            ai_predictions: []
        };
    } catch (error) {
        console.error('Error fetching marine impact metrics:', error);
        return {
            species_impact: [],
            pollution_sources: [],
            ecosystem_health: {},
            ai_predictions: []
        };
    }
};


export const login = async (credentials: any) => {
    try {
        console.log('🔑 Attempting login...', {
            email: credentials.email,
            apiUrl: API_URL,
            endpoint: `${API_URL}/auth/login`
        });

        const response = await api.post('/auth/login', credentials);

        console.log('✅ Login successful:', {
            email: credentials.email,
            userId: response.data?.user?.id || 'N/A'
        });

        return response.data;
    } catch (error: any) {
        console.error('❌ Login error:', {
            email: credentials.email,
            apiUrl: API_URL,
            error: error
        });

        if (error.response) {
            // Server responded with error
            const errorMessage = error.response.data?.detail ||
                error.response.data?.message ||
                'Login failed';
            console.error('Server error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request made but no response received
            console.error('Network error - no response received:', {
                apiUrl: API_URL,
                request: error.request
            });
            throw new Error(`Network error: Cannot reach server at ${API_URL}. Please ensure the backend is running.`);
        } else {
            // Something else happened
            console.error('Error details:', error.message);
            throw new Error(error.message || 'An unexpected error occurred during login');
        }
    }
};

export const register = async (userData: any) => {
    try {
        console.log('🚀 Attempting registration...', {
            email: userData.email,
            apiUrl: API_URL,
            endpoint: `${API_URL}/auth/register`
        });

        const response = await api.post('/auth/register', userData);

        console.log('✅ Registration successful:', {
            email: userData.email,
            userId: response.data?.user?.id || 'N/A'
        });

        return response.data;
    } catch (error: any) {
        console.error('❌ Registration error:', {
            email: userData.email,
            apiUrl: API_URL,
            error: error
        });

        if (error.response) {
            // Server responded with error
            const errorMessage = error.response.data?.detail ||
                error.response.data?.message ||
                'Registration failed';
            console.error('Server error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request made but no response received
            console.error('Network error - no response received:', {
                apiUrl: API_URL,
                request: error.request
            });
            throw new Error(`Network error: Cannot reach server at ${API_URL}. Please ensure the backend is running.`);
        } else {
            // Something else happened
            console.error('Error details:', error.message);
            throw new Error(error.message || 'An unexpected error occurred during registration');
        }
    }
};

export const fetchUserReports = async (userId: string) => {
    try {
        const response = await api.get(`/reports/user/${userId}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching user reports:', error);
        return [];
    }
};

export const submitReport = async (formData: FormData) => {
    try {
        console.log('Submitting report to:', `${API_URL}/reports/`);
        // Log form data keys for debugging (values might be sensitive or binary)
        const formDataKeys: string[] = [];
        formData.forEach((_, key) => formDataKeys.push(key));
        console.log('FormData keys:', formDataKeys);

        const response = await api.post('/reports/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Report submission successful:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error submitting report:', error);

        // Enhanced error logging for debugging
        if (error.response) {
            console.error('Response error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            // Return the error message from backend if available
            throw new Error(error.response.data?.detail || error.response.data?.message || 'Report submission failed');
        } else if (error.request) {
            console.error('Request error - no response received:', error.request);
            throw new Error('Network error: No response received from server. Please check your connection.');
        } else {
            console.error('Error details:', error.message);
            throw error;
        }
    }
};

export default api;
