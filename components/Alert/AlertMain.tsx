// AlertMain.tsx
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
			setAlerts(prev => [...prev, { id, variant, message, position }]);
		}
	};

	const closeAlert = (id: number) => {
		setAlerts(prev => prev.filter(alert => alert.id !== id));
	};

	// Trigger alert based on prop
	useEffect(() => {
		if (alert) {
			showAlert(alert.variant, alert.message, alert.position);
		}
	}, [alert?.variant, alert?.message, alert?.position]); // Use specific properties to avoid unnecessary triggers

	// Group alerts by position for better stacking
	const groupedAlerts = alerts.reduce((acc, alert) => {
		acc[alert.position] = acc[alert.position] || [];
		acc[alert.position].push(alert);
		return acc;
	}, {} as Record<AlertState['position'], AlertState[]>);

	return (
		<div className="min-h-screen relative">
			{/* Alert Container */}
			<div className="fixed inset-0 z-50 pointer-events-none">
				{Object.entries(groupedAlerts).map(([position, positionAlerts]) => (
					<div
						key={position}
						className={`
              absolute flex
              ${position.includes('top') ? 'flex-col' : 'flex-col-reverse'}
              ${position.includes('left') ? 'left-0' : position.includes('right') ? 'right-0' : 'left-1/2 -translate-x-1/2'}
              ${position.includes('top') ? 'top-0' : 'bottom-0'}
              p-4 gap-2
            `}
					>
						{positionAlerts.map(alert => (
							<Alert
								key={alert.id}
								variant={alert.variant}
								message={alert.message}
								position={alert.position}
								onClose={() => closeAlert(alert.id)}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

export default AlertMain;