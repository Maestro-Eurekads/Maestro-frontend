'use client'
import Image from 'next/image'
import nike from '../public/nike.svg';
import plus from '../public/plus.svg';
import white from '../public/white-plus.svg';
import down from '../public/ri-arrow-down-s-line.svg';



const Header = () => {








  return (
    <div id="header">
      <div className='hand_bugger flex items-center'  >
        <button className='nike_btn'>
          <div className='flex items-center gap-2'>
            <Image src={nike} alt='nike' />

            <p className='btw_nike_text'>Nike</p>
          </div>
          <Image src={down} alt='menu' />
        </button>

        <button className='client_btn_text'>  <Image src={plus} alt='plus' />New client</button>
      </div>




      <div className='profiledropdown_container_main'>

        <div className='profiledropdown_container'  >
          <button className='new_plan_btn'>
            <Image src={white} alt='white' />
            <p className='new_plan_btn_text'>New media plan</p>
          </button>
          <div className='profile_container'>
            MD
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;




