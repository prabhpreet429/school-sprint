// Auth utility functions

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  schoolId: number;
  schoolName: string;
  classId?: number; // For students - their class ID
  classIds?: number[]; // For teachers - array of class IDs they teach
  className?: string; // For students - their class name
  classes?: Array<{ id: number; name: string }>; // For teachers - array of classes they teach
  studentId?: number; // For students - their student record ID
  teacherId?: number; // For teachers - their teacher record ID
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  admin?: User;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Store token in both localStorage and cookie
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    // Set cookie that expires in 7 days
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }
};

// Get token from localStorage (cookie is checked by middleware)
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Remove token from both localStorage and cookie
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

// Login
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      setToken(data.token);
      return data;
    }

    return {
      success: false,
      message: data.message || "Login failed",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An error occurred during login",
    };
  }
};

// Register (only for admin)
export const register = async (
  email: string,
  password: string,
  username: string,
  schoolName: string,
  schoolAddressLine1: string,
  schoolState: string,
  schoolPinCode: string,
  schoolCountry: string,
  schoolTimezone: string,
  role: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email, 
        password, 
        username, 
        schoolName,
        schoolAddressLine1,
        schoolState,
        schoolPinCode,
        schoolCountry,
        schoolTimezone,
        role 
      }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      setToken(data.token);
      return data;
    }

    return {
      success: false,
      message: data.message || "Registration failed",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration",
    };
  }
};

// Create account for existing person (Admin only)
export const createAccount = async (
  email: string,
  password: string,
  personType: "teacher" | "student",
  personId: number,
  schoolId: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to create accounts",
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/create-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        password,
        personType,
        personId,
        schoolId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: data.message || "Account created successfully",
      };
    }

    return {
      success: false,
      message: data.message || "Failed to create account",
    };
  } catch (error) {
    console.error("Create account error:", error);
    return {
      success: false,
      message: "An error occurred while creating the account",
    };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success && data.admin) {
      return data.admin;
    }

    return null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Logout
export const logout = () => {
  removeToken();
};
