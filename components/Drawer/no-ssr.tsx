"use client";

import { useEffect, useState } from "react";

export default function NoSSR({ children }: { children: React.ReactNode }) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null; // Prevents rendering on the server

	return <>{children}</>;
}
