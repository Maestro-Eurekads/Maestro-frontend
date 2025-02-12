


interface CreationFlowProps {
	active: number;
	setActive: React.Dispatch<React.SetStateAction<number>>;
}

const CreationFlow: React.FC<CreationFlowProps> = ({ active }) => {


	return (
		<div id='Sidenavbar'>
			<div id='SideBar__container' className='SideBar__container'>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>1</div>
						<div className='vl'></div>
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className={active ? "SideBar_state_text_active" : "SideBar_state_text"}>Define campaign objective</div>
						{/* <div className='SideBar_state_circle_container'>
							{active >= 2 ? <CheckIcon className='coloricon' /> : <div className='SideBar_state_circle'></div>} */}
						{/* <span className={active >= 2 ? 'SideBar_state_circle_text_active' : active === 1 ? 'SideBar_state_circle_text_active_move' : 'SideBar_state_circle_text'}>
								Job Profile</span> */}
						{/* </div> */}
					</div>
				</div>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>2</div>
						<div className='vl'></div>
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'>Map funnel stages</div>
					</div>
				</div>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>3</div>
						<div className='vl'></div>
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'> Select channel mix</div>
						{/* <div className='SideBar_state_circle_container'>
							{active >= 4 ? <CheckIcon className='coloricon' /> : <div className='SideBar_state_circle'></div>} */}
						{/* <span className={active >= 4 ? 'SideBar_state_circle_text_active' : active === 3 ? 'SideBar_state_circle_text_active_move' : 'SideBar_state_circle_text'}>{' '} Recruitment settings</span> */}
						{/* </div> */}
					</div>
				</div>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>3</div>
						<div className='vl'></div>
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'>Formats selection</div>
						{/* <div className='SideBar_state_circle_container'>
							{active >= 4 ? <CheckIcon className='coloricon' /> : <div className='SideBar_state_circle'></div>} */}
						{/* <span className={active >= 4 ? 'SideBar_state_circle_text_active' : active === 3 ? 'SideBar_state_circle_text_active_move' : 'SideBar_state_circle_text'}>{' '} Recruitment settings</span> */}
						{/* </div> */}
					</div>
				</div>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>3</div>
						<div className='vl' />
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'>Set buy objectives and types</div>

					</div>
				</div>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>3</div>
						<div className='vl'></div>
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'>Plan campaign schedule</div>

					</div>
				</div>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>3</div>
						<div className='vl'></div>
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'>Configure ad sets and budget</div>

					</div>
				</div>
				<div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>4</div>
						{/* <div className='vl_two'></div> */}
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'>Establish goals</div>
					</div>
				</div>
				{/* <div className='SideBar__JobSideBar'>
					<div className='SideBar__state__container'>
						<div className='SideBar__JobMenu'>5</div>
					</div>
					<div className='SideBar__JobMenu_state'>
						<div className='SideBar_state_text'> Summary</div>
					</div>
				</div> */}

			</div>

		</div>
	)
}

export default CreationFlow