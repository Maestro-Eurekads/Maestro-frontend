import React from 'react'
import ToggleSwitch from './ToggleSwitch'
import Header from '../../components/Header'
// import Image from 'next/image'
// import blueBtn from '../../public/blueBtn.svg';
import Dropdowns from './Dropdowns';
import Table from '../../components/Table';
import TableModel from './TableModel';




const Homepage = () => {
	return (
		<div id="page-wrapper">
			<Header />
			<main  >
				<ToggleSwitch />
				<div className='flex items-center gap-2 mt-[36.5px]'>
					<h1 className='media_text'>Media plans</h1>

					<TableModel />
					{/* <button>
						<Image src={blueBtn} alt='menu' />
					</button> */}

				</div>
				<Dropdowns />

				<Table />
			</main>
		</div>
	)
}

export default Homepage