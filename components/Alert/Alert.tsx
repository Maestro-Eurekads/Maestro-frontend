// Alert.tsx
import { useEffect, useState } from 'react';

type Variant = 'success' | 'error' | 'info' | 'warning';
type Position =
	| 'top-left'
	| 'top-middle'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-middle'
	| 'bottom-right';

interface AlertProps {
	variant: Variant;
	message: string;
	position: Position;
	onClose: () => void;
}

const Alert = ({ variant, message, onClose }: AlertProps) => {
	const [isClosing, setIsClosing] = useState<boolean>(false);

	const variantStyles: Record<Variant, string> = {
		success: 'bg-green-50 border-green-400 text-green-800',
		error: 'bg-red-50 border-red-400 text-red-800',
		info: 'bg-blue-50 border-blue-400 text-blue-800',
		warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsClosing(true);
		}, 5000);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (isClosing) {
			const timer = setTimeout(() => {
				onClose();
			}, 300); // Matches animation duration
			return () => clearTimeout(timer);
		}
	}, [isClosing, onClose]);

	return (
		<div
			className={`
        ${variantStyles[variant]}
        border-l-4 p-4 rounded-lg shadow-md
        flex items-center justify-between
        w-80 max-w-full
        transition-all duration-300
        pointer-events-auto
        ${isClosing ? 'animate-fade-out opacity-0' : 'animate-fade-in'}
      `}
		>
			<span>{message}</span>
			<button
				onClick={() => setIsClosing(true)}
				className="ml-4 text-current hover:opacity-75"
				aria-label="Close alert"
			>
				✕
			</button>
		</div>
	);
};

export default Alert;