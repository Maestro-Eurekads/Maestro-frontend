import { useEffect, useState } from 'react';
import Alert from './Alert';

// Define types for alert state
interface AlertState {
	id: number;
	variant: 'success' | 'error' | 'info' | 'warning';
	message: string;
	position:
	| 'top-left'
	| 'top-middle'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-middle'
	| 'bottom-right';
}

// Define props interface
interface AlertMainProps {
	alert?: {
		variant: AlertState['variant'];
		message: string;
		position: AlertState['position'];
	};
}

const AlertMain = ({ alert }: AlertMainProps) => {
	const [alerts, setAlerts] = useState<AlertState[]>([]);

	const showAlert = (
		variant: AlertState['variant'],
		message: string,
		position: AlertState['position']
	) => {
		const id = Date.now();

		// Prevent duplicate alerts with the same message and position
		if (!alerts.some(a => a.message === message && a.position === position)) {
			setAlerts([{ id, variant, message, position }]); // Replace alerts array to ensure only one alert exists
		}
	};

	const closeAlert = (id: number) => {
		setAlerts([]);
	};

	// Trigger alert based on prop
	useEffect(() => {
		if (alert) {
			showAlert(alert.variant, alert.message, alert.position);

			// Automatically close alert after 3 seconds
			const timer = setTimeout(() => {
				setAlerts([]);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [alert?.variant, alert?.message, alert?.position]); // Use specific properties to avoid unnecessary triggers

	return (
		<div className="min-h-screen relative">
			{/* Alert Container */}
			<div className="fixed inset-0 z-50 pointer-events-none">
				{alerts.length > 0 && (
					<div
						className={`
              absolute flex flex-col
              ${alerts[0].position.includes('top') ? 'top-0' : 'bottom-20'}
              ${alerts[0].position.includes('left') ? 'left-0' : alerts[0].position.includes('right') ? 'right-0' : 'left-1/2 -translate-x-1/2'}
              p-4 gap-2
            `}
					>
						<Alert
							key={alerts[0].id}
							variant={alerts[0].variant}
							message={alerts[0].message}
							position={alerts[0].position}
							onClose={() => closeAlert(alerts[0].id)}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default AlertMain;
