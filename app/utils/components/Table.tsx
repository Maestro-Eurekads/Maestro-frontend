import Image from 'next/image'
import edit from '../public/ri-edit-line.svg';
import share from '../public/ri-share-box-line.svg';
import line from '../public/ri-file-copy-line.svg';
import ProgressBar from './ProgressBar';


const Table = () => {

	return (
		<div className='table-container mt-[20px] rounded-[8px] overflow-x-auto'>
			<table >
				<thead>
					<tr>
						<th>Name</th>
						<th>Version</th>
						<th>Progress</th>
						<th>Status</th>
						<th>Budget</th>
						<th>Made by</th>
						<th>Approved by</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody className="data-table-content">

					<tr >
						<td className='whitespace-nowrap'>Campaign 1 - Running</td>
						<td >V9</td>
						<td >
							<ProgressBar progress={100} />
						</td>
						<td >
							<div className='approved'>Approved</div>
						</td>
						<td >250,000 €</td>
						<td >
							<div className='flex items-center whitespace-nowrap gap-3'>
								<div className='view_content_table'>MD</div>
								Maxime Brevet
							</div>
						</td>
						<td className=' '>
							<div className='flex items-center whitespace-nowrap gap-3'>
								<div className='view_content_table'>JB</div>
								<p>Julien Dahmoun</p>
							</div>
						</td>
						<td>
							<div className='flex gap-4'>
								<Image src={edit} alt='menu' />
								<Image src={share} alt='menu' />
								<Image src={line} alt='menu' />
							</div>
						</td>
					</tr>
					<tr >
						<td className='whitespace-nowrap'>Campaign 1 - Running</td>
						<td >V9</td>
						<td >
							<ProgressBar progress={25} />
						</td>
						<td >
							<div className='approved'>Approved</div>
						</td>
						<td >250,000 €</td>
						<td >
							<div className='flex items-center whitespace-nowrap gap-3'>
								<div className='view_content_table'>MD</div>
								Maxime Brevet
							</div>
						</td>
						<td className=' '>
							<div className='flex items-center whitespace-nowrap gap-3'>
								<div className='view_content_table'>JB</div>
								<p>Julien Dahmoun</p>
							</div>
						</td>
						<td>
							<div className='flex gap-4'>
								<Image src={edit} alt='menu' />
								<Image src={share} alt='menu' />
								<Image src={line} alt='menu' />
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}

export default Table