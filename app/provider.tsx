'use client';
import React from 'react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { store } from '../store/store';
import { ProgressProvider } from '@bprogress/next/dist/app';
import "react-loading-skeleton/dist/skeleton.css";

const NewProvider = ({ children, session }: React.PropsWithChildren<{ session: any }>) => {
	return (
		<SessionProvider session={session}>
			<ProgressProvider
				height="4px"
				color="#0866FF"
				options={{ showSpinner: false }}
				shallowRouting>
				<Provider store={store}>
					{children}
				</Provider>
			</ProgressProvider>
		</SessionProvider>
	);
}

export default NewProvider;
