import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../services/axiosConfig";

const AuthContext = createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			const token = localStorage.getItem("token");
			if (token) {
				const response = await axiosInstance.get("/auth/me");
				setCurrentUser(response.data);
			}
		} catch (error) {
			console.error("Auth status check failed:", error);
			localStorage.removeItem("token");
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			const response = await axiosInstance.post("/auth/login", {
				email,
				password,
			});
			const { token, user } = response.data;
			localStorage.setItem("token", token);
			setCurrentUser(user);
			return user;
		} catch (error) {
			const message = error.response?.data?.message || "Login failed";
			console.error("Login error:", message);
			throw new Error(message);
		}
	};

	const register = async (userData) => {
		try {
			const response = await axiosInstance.post(
				"/auth/register",
				userData
			);
			const { token, user } = response.data;
			localStorage.setItem("token", token);
			setCurrentUser(user);
			return user;
		} catch (error) {
			const message =
				error.response?.data?.message || "Registration failed";
			console.error("Registration error:", error);
			throw new Error(message);
		}
	};

	const logout = async () => {
		try {
			await axiosInstance.post("/auth/logout");
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			localStorage.removeItem("token");
			setCurrentUser(null);
		}
	};

	const updateProfile = async (userData) => {
		try {
			const response = await axiosInstance.put("/auth/profile", userData);
			setCurrentUser(response.data);
			return response.data;
		} catch (error) {
			const message =
				error.response?.data?.message || "Profile update failed";
			console.error("Profile update error:", error);
			throw new Error(message);
		}
	};

	const value = {
		currentUser,
		loading,
		login,
		register,
		logout,
		updateProfile,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
}
