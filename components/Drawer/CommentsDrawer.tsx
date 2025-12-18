import Image from "next/image";
import closecircle from "../../public/close-circle.svg";
import Mmessages from "../../public/message-2.svg";
import Comments from "./Comments";
import AddCommentReply from "./AddCommentReply";
import { useComments } from "app/utils/CommentProvider";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getContrastingColor, getRandomColor } from "components/Options";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { SVGLoader } from "components/SVGLoader";
import AlertMain from "components/Alert/AlertMain";
import { useUserPrivileges } from "utils/userPrivileges";
import { reset } from "features/Comment/commentSlice";
import clsx from "clsx";

const CommentsDrawer = ({ isOpen, onClose }) => {
	const { opportunities, setViewcommentsId, viewcommentsId,
		addCommentOpportunity, setOpportunities, createCommentsError,
		createCommentsSuccess, approvedError, replyError, setIsCreateOpen, setShow } = useComments();

	const { isAgencyApprover, isFinancialApprover, isAdmin } = useUserPrivileges();

	const { data, isLoading } = useAppSelector((state) => state.comment);
	const dispatch = useAppDispatch();
	const { campaignData } = useCampaigns();

	const [alert, setAlert] = useState(null);
	const [commentColors, setCommentColors] = useState({});
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isMouseOverDrawer, setIsMouseOverDrawer] = useState(false);

	const commentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
	const [screenSize, setScreenSize] = useState('desktop');

	useEffect(() => {
		const updateScreenSize = () => {
			const width = window.innerWidth;
			if (width <= 768) {
				setScreenSize('mobile');
			} else if (width <= 1024) {
				setScreenSize('tablet');
			} else if (width <= 1440) {
				setScreenSize('laptop');
			} else {
				setScreenSize('desktop');
			}
		};

		updateScreenSize();
		window.addEventListener('resize', updateScreenSize);

		return () => window.removeEventListener('resize', updateScreenSize);
	}, []);

	// Then create an offset map
	const offsetMap = {
		mobile: 800,
		tablet: 700,
		laptop: 600,
		desktop: 500
	};

	// Use it in your click handler
	const dynamicOffset = offsetMap[screenSize];

	const comment = useMemo(() => {
		if (!data) return [];
		return data.filter((comment) => comment?.client_commentID === null);
	}, [data]);

	const comments = useMemo(() => {
		return [...comment].sort(
			(a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
		);
	}, [comment]);

	useEffect(() => {
		const newColors = {};
		comments.forEach((comment) => {
			if (!commentColors[comment?.documentId]) {
				const randomColor = getRandomColor();
				newColors[comment?.documentId] = {
					color: randomColor,
					contrastingColor: getContrastingColor(randomColor),
				};
			}
		});
		setCommentColors((prevColors) => ({ ...prevColors, ...newColors }));
	}, [comments]);

	// Scroll and highlight selected comment
	useEffect(() => {
		if (viewcommentsId && commentRefs.current[viewcommentsId]) {
			const el = commentRefs.current[viewcommentsId];
			el?.scrollIntoView({ behavior: "smooth", block: "center" });

			const timeout = setTimeout(() => {
				setViewcommentsId('');
			}, 3000);

			return () => clearTimeout(timeout);
		}
	}, [viewcommentsId]);

	const createCommentOpportunity = (x?: number, y?: number) => {
		console.log("Creating comment opportunity at:", x, y);
		const newOpportunity = {
			commentId: Date.now(),
			text: "New Comment Opportunity",
			position: { x: x || 400, y: y || 300 },
		};

		if (opportunities.length === 0) {
			setIsCreateOpen(true);
			addCommentOpportunity(newOpportunity);
			// Automatically open the comment dialog for new comments
			setTimeout(() => {
				setShow(true);
			}, 100);
		}
	};

	const handleClose = () => {
		setOpportunities([]);
		onClose(false);
		setViewcommentsId('');
		dispatch(reset());
		// Reset the show state when closing
		setShow(false);
	};

	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => setAlert(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [alert]);

	useEffect(() => {
		if (createCommentsSuccess) {
			setAlert({ variant: "success", message: "Comment created!", position: "bottom-right" });
		}
		if (createCommentsError) {
			setAlert({
				variant: "error", message: createCommentsError.
					response.data || createCommentsError.message, position: "bottom-right"
			});
		}
		if (replyError) {
			setAlert({
				variant: "error", message: replyError.
					response.data?.error?.message || replyError?.message, position: "bottom-right"
			});
		}
		if (approvedError) {
			setAlert({
				variant: "error", message: replyError.
					response.data?.error?.message || replyError?.message, position: "bottom-right"
			});
		}
	}, [createCommentsError, replyError]);

	// Change cursor style when drawer is open, but not over drawer
	useEffect(() => {
		if (isOpen && !isMouseOverDrawer) {
			document.body.style.cursor = 'crosshair';
		} else {
			document.body.style.cursor = 'default';
		}

		return () => {
			document.body.style.cursor = 'default';
		};
	}, [isOpen, isMouseOverDrawer]);

	// Track mouse movement and check if over drawer
	useEffect(() => {
		const handleMouseMove = (e) => {
			setMousePosition({ x: e.clientX, y: e.clientY });

			// Check if mouse is over drawer
			const drawerElement = document.querySelector('.drawer-container');
			if (drawerElement) {
				const drawerRect = drawerElement.getBoundingClientRect();
				const overDrawer = e.clientX >= drawerRect.left &&
					e.clientX <= drawerRect.right &&
					e.clientY >= drawerRect.top &&
					e.clientY <= drawerRect.bottom;
				setIsMouseOverDrawer(overDrawer);
			}
		};

		if (isOpen) {
			document.addEventListener('mousemove', handleMouseMove);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
		};
	}, [isOpen]);

	// Handle clicks anywhere on the page to create comments
	useEffect(() => {
		const handlePageClick = (e) => {
			console.log("Click detected");

			// Don't create comment if clicking inside the drawer
			if (e.target.closest('.drawer-container')) {
				console.log("Clicked inside drawer, ignoring");
				return;
			}

			// Don't create comment if clicking on existing comment opportunities
			if (e.target.closest('.drag-handle')) {
				console.log("Clicked on drag handle, ignoring");
				return;
			}

			console.log("Creating comment at click position");

			// Find the MessageContainer element to get its position
			const messageContainer = document.querySelector('.relative');
			if (!messageContainer) {
				console.log("MessageContainer not found, using page coordinates");
				// Fallback to page coordinates if container not found
				const position = {
					x: e.pageX,
					y: e.pageY - dynamicOffset // Apply the same offset
				};
				createCommentOpportunity(position.x, position.y);
				return;
			}

			const containerRect = messageContainer.getBoundingClientRect();

			// Calculate position relative to the MessageContainer
			// The -500 offset suggests there's some layout offset we need to account for
			const position = {
				x: e.clientX - containerRect.left,
				y: e.clientY - containerRect.top - dynamicOffset
			};

			createCommentOpportunity(position.x, position.y);
		};

		if (isOpen) {
			// Add a slight delay to prevent immediate triggering
			const timeoutId = setTimeout(() => {
				document.addEventListener('click', handlePageClick);
			}, 100);

			return () => {
				clearTimeout(timeoutId);
				document.removeEventListener('click', handlePageClick);
			};
		}
	}, [isOpen, opportunities.length, addCommentOpportunity, setIsCreateOpen]);

	return (
		<>
			{isOpen && !isMouseOverDrawer && (
				<div
					className="fixed pointer-events-none z-[9998]"
					style={{
						left: mousePosition.x + 10,
						top: mousePosition.y + 10,
					}}
				>
					<div className="bg-[#3175FF] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
						Click anywhere to add comment
					</div>
				</div>
			)}
			<div className={`drawer-container ${isOpen ? "drawer-open" : ""} max-h-screen`}>
				{alert && <AlertMain alert={alert} />}

				<div className="flex w-full justify-between p-3">
					<div>
						<h3 className="font-medium text-[22px] text-[#292929]">Comments For</h3>
						<div className="flex items-center gap-2 w-full">
							<p className="font-medium text-[16px] text-[#292929] mb-4">
								{campaignData?.funnel_stages?.length > 0
									? campaignData?.funnel_stages?.length > 3
										? campaignData?.funnel_stages?.slice(0, 3).join(" · ") + " ..."
										: campaignData?.funnel_stages?.join(" · ")
									: ""}
							</p>
						</div>
					</div>
					<button onClick={handleClose}>
						<Image src={closecircle} alt="Close" />
					</button>
				</div>

				<div className="w-full flex flex-col justify-center items-center gap-5 mt-[-10px] mb-4">
					<button>
						<Image src={Mmessages} alt="Add Comment Opportunity" />
					</button>
					<h6 className="w-[70%] text-center text-black text-[15px]">
						{isOpen ?
							"Comment mode active! Click anywhere on the page to add a comment at that location." :
							"Add a comment, your comments will appear here!"
						}
					</h6>
				</div>

				{/* Comments Section */}
				<div className="faq-container p-5 overflow-y-auto max-h-[calc(88vh-100px)]">
					{isLoading ? (
						<div className="w-full h-full flex justify-center items-center py-5">
							<SVGLoader width={"35px"} height={"35px"} color={"#00A36C"} />
						</div>
					) : (
						comments?.map((comment) => {
							const { color, contrastingColor } = commentColors[comment?.documentId] || {};
							return (
								<div
									key={comment?.documentId}
									ref={(el) => {
										commentRefs.current[comment?.documentId] = el;
									}}
									className={clsx(
										"flex flex-col justify-between p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] rounded-lg border-box mb-5 transition-all duration-500",
										viewcommentsId === comment?.documentId && "ring-2 ring-[#00A36C]"
									)}
								>
									<Comments
										comment={comment}
										contrastingColor={contrastingColor}
										isAgencyApprover={isAgencyApprover}
										isFinancialApprover={isFinancialApprover}
										isAdmin={isAdmin}
									/>
									<AddCommentReply
										documentId={comment?.documentId}
										contrastingColor={contrastingColor}
										commentId={comment?.commentId}
									/>
								</div>
							);
						})
					)}
				</div>
			</div>
		</>
	);
};

export default CommentsDrawer;