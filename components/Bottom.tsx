import Image from "next/image";
import Continue from '../public/arrow-back-outline.svg';
import Back from '../public/eva_arrow-back-outline.svg';
const Bottom = () => {

	return (
		<footer id="footer" className="w-full">

			<div className="flex justify-between w-full">
				<button className="bottom_black_back_btn">
					<Image src={Back} alt="menu" />
					<p>Back</p>
				</button>
				<button className="bottom_black_next_btn">
					<p>Continue</p>
					<Image src={Continue} alt="menu" />
				</button>
			</div>
		</footer>
	)
}

export default Bottom