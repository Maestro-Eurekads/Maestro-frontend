"use client"
import React, { useState } from 'react'
import ToggleSwitch from './ToggleSwitch'
import Header from '../../components/Header'
import TableModel from './TableModel';
import Overview from './components/Overview'
import Dashboard from './components/Dashboard'
import FinanceView from './components/FinanceView';
import AddFinanceModal from './components/AddFinanceModal';


const Homepage = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [active, setActive] = useState("Overview");
	const [openModal, setOpenModal] = useState(false);


	return (
		<>
			<div id="page-wrapper">
				<Header setIsOpen={setIsOpen} />
				<main className="!px-0">
					<div >
						<div className='px-[72px]'>
							<ToggleSwitch active={active} setActive={setActive} />
						</div>
						{active === "Finance" ? <FinanceView setOpenModal={setOpenModal} /> : active === "Dashboard" ? <Dashboard /> : <Overview />}
					</div>
				</main>
				<TableModel isOpen={isOpen} setIsOpen={setIsOpen} />
				<AddFinanceModal isOpen={openModal} setIsOpen={setOpenModal} />
			</div>
		</>
	)
}

export default Homepage