"use client"
import React, { useState } from 'react'
import ToggleSwitch from './ToggleSwitch'
import Header from '../../components/Header'
import Image from 'next/image'
import blueBtn from '../../public/blueBtn.svg';
import Dropdowns from './Dropdowns';
import Table from '../../components/Table';
import TableModel from './TableModel';




const Homepage = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [active, setActive] = useState("Overview");

	console.log('active-active', active)


	return (
		<div id="page-wrapper">
			<Header setIsOpen={setIsOpen} />
			<main  >
				<ToggleSwitch active={active} setActive={setActive} />
				<div className='flex items-center gap-2 mt-[36.5px]'>
					<h1 className='media_text'>Media plans</h1>
					<button>
						<Image src={blueBtn} alt='menu' />
					</button>
				</div>
				<Dropdowns />
				{active === "Dashboard" ? "" : <Table />}

			</main>
			<TableModel isOpen={isOpen} setIsOpen={setIsOpen} />
		</div>
	)
}

export default Homepage