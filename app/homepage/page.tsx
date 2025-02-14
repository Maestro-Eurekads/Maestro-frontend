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



	return (
		<div id="page-wrapper">
			<Header setIsOpen={setIsOpen} />
			<main  >
				<ToggleSwitch />
				<div className='flex items-center gap-2 mt-[36.5px]'>
					<h1 className='media_text'>Media plans</h1>
					<button>
						<Image src={blueBtn} alt='menu' />
					</button>
				</div>
				<Dropdowns />
				<Table />
			</main>
			<TableModel isOpen={isOpen} setIsOpen={setIsOpen} />
		</div>
	)
}

export default Homepage