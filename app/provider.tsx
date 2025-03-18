'use client';
import React from 'react'
import { store } from '../store/store'
import { Provider } from 'react-redux'
import { ProgressProvider } from '@bprogress/next/dist/app';
import "react-loading-skeleton/dist/skeleton.css";

const NewProvider = ({ children }: React.PropsWithChildren) => {

	return (
		<div>
			<ProgressProvider
				height="4px"
				color="#0866FF"
				options={{ showSpinner: false }}
				shallowRouting>
				<Provider store={store}>
					{children}
				</Provider>
			</ProgressProvider>
		</div>
	)
}

export default NewProvider




