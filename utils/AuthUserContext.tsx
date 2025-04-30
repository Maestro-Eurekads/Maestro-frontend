// context/AuthContext.tsx
'use client';


import { createContext, useContext, useEffect, useState } from 'react';


interface AuthContextType {
	token: string | null;
	setToken: (token: string | null) => void;
}

const AuthUserContext = createContext<AuthContextType | undefined>(undefined);

export const AuthUserProvider = ({ children }: { children: React.ReactNode }) => {

	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const storedToken = localStorage.getItem('authToken');
		if (storedToken) setToken(storedToken);
	}, []);

	useEffect(() => {
		if (token) {
			localStorage.setItem('authUserToken', token);
		} else {
			localStorage.removeItem('authUserToken');
		}
	}, [token]);

	return (
		<AuthUserContext.Provider value={{ token, setToken }}>
			{children}
		</AuthUserContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthUserContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};
