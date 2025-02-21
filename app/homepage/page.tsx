"use client"
import React, { useState } from 'react'
import ToggleSwitch from './ToggleSwitch'
import Header from '../../components/Header'
import Image from 'next/image'
import blueBtn from '../../public/blueBtn.svg';
import Dropdowns from './Dropdowns';
import Table from '../../components/Table';
import TableModel from './TableModel';
import Overview from './components/Overview'
import Dashboard from './components/Dashboard'




const Homepage = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [active, setActive] = useState("Overview");

	console.log('active-active', active)


	return (
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
	)
}

export default Homepage