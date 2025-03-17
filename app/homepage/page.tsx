"use client"
import React, { useState } from 'react'
import ToggleSwitch from './ToggleSwitch'
import Header from '../../components/Header'
import TableModel from './TableModel';
import Overview from './components/Overview'
import Dashboard from './components/Dashboard'
import UploadModal from '../../components/UploadModal/UploadModal';




const Homepage = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [active, setActive] = useState("Overview");




	return (
		<>
		<div id="page-wrapper">
			<Header setIsOpen={setIsOpen} />
			<main className="!px-0">
				<div >
					<div className='px-[72px]'>
						<ToggleSwitch active={active} setActive={setActive} />
					</div>
					{active === "Dashboard" ? <Dashboard /> : <Overview />}
				</div>
			</main>
			<TableModel isOpen={isOpen} setIsOpen={setIsOpen} />
		</div>
      <UploadModal />
		</>
	)
}

export default Homepage