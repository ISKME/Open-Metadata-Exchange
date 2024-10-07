// @ts-ignore
import { useEffect, useState } from 'react';
import { Dropdown } from 'widgets/Dropdown';
import { SearchGrid } from 'widgets/SearchGrid/ui/SearchGrid';
import { CollectionItemCard } from 'entities/CollectionItemCard';
import { Portal } from 'features/Portal';
import axios from 'axios';
import cls from './SharedContent.module.scss';

interface SubscribedContentProps {
	className?: string;
}

let tempUnshareTitle = '';

export const SharedContent = ({ className }: SubscribedContentProps) => {
	const [isShown, setIsShown] = useState(false);
	const [chosen, setChosen] = useState<any>('');
	const [shareInfo, setShareInfo] = useState<any>('');
	const [addInfo, setAddInfo] = useState<any>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [added, setAdded] = useState([]);

	useEffect(() => {
		if (!isShown) {
			setChosen('');
		}
	}, [isShown]);

	const CardShare = ({ data, title, isNew = false }) => {
		function unshare() {
			setIsShown(true);
			setChosen(data.id);
			tempUnshareTitle = title;
		}

		return (
			<div>
				<CollectionItemCard
					key={data.id}
					collection={data}
					className={cls.cardWidth}
					isNew={isNew}
				/>
				<div className={cls.labelText} onClick={unshare}>
					Unshare collection
				</div>
			</div>
		);
	};

	return (
		<div>
			<Portal visible={isShown}>
				<div className={cls['snackbar-but-cooler']}>
					<div className={cls['frame']} />
					<div className={cls['text-container']}>
						<svg
							className={cls['vector']}
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none">
							<path
								d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM18 13.2H6V10.8H18V13.2Z"
								fill="#FF507A"
							/>
						</svg>
						<div className={cls['text']}>
							<div className={cls['text-only']}>
								<div className={cls['head']}>
									Remove this collection from the OER Exchange
								</div>
								<p className={cls['subhead']}>
									By unsharing, this collection will no longer appear in the OER
									Exchange and be removed from other microsites. You may share
									that again later.
								</p>
							</div>
							<div className={cls['div']}>
								<button
									className={cls['button']}
									onClick={() => {
										axios
											.post(
												`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/site-collections/picker/`,
												null,
												{
													withCredentials: false,
													params: { unshare: [chosen] },
												}
											)
											.then(() => {
												if (chosen) {
													setShareInfo(tempUnshareTitle);
													setChosen('');
													setIsShown(false);
												} else {
													window.location.reload();
												}
											});
									}}>
									<div className={cls['label-text']}>
										Unshare this collection
									</div>
								</button>
								<p
									className={cls['text-wrapper']}
									onClick={() => setIsShown(false)}>
									I’ve decided to keep sharing the collection
								</p>
							</div>
						</div>
						<div className={cls['action']}>
							<div
								className={cls['button-icon']}
								onClick={() => setIsShown(false)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none">
									<path
										d="M18.295 7.115C18.6844 6.72564 18.6844 6.09436 18.295 5.705C17.9056 5.31564 17.2744 5.31564 16.885 5.705L12 10.59L7.115 5.705C6.72564 5.31564 6.09436 5.31564 5.705 5.705C5.31564 6.09436 5.31564 6.72564 5.705 7.115L10.59 12L5.705 16.885C5.31564 17.2744 5.31564 17.9056 5.705 18.295C6.09436 18.6844 6.72564 18.6844 7.115 18.295L12 13.41L16.885 18.295C17.2744 18.6844 17.9056 18.6844 18.295 18.295C18.6844 17.9056 18.6844 17.2744 18.295 16.885L13.41 12L18.295 7.115Z"
										fill="black"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</Portal>
			<div className={cls.callout}>
				<div className={cls.frame}>
					<h1>Search shared content</h1>
					<p>All of the content you share to the OER Exchange is found here.</p>
				</div>
				<div className={cls.calloutAction}>
					<p>Share a new collection on the OER Exchange here</p>
					<div className={cls.updates}>
						<div
							className={cls.notificationIcon}
							onClick={() => setIsOpen(!isOpen)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none">
								<path
									d="M11.5 1.75C11.5 0.920312 10.8297 0.25 10 0.25C9.17031 0.25 8.5 0.920312 8.5 1.75V8.5H1.75C0.920312 8.5 0.25 9.17031 0.25 10C0.25 10.8297 0.920312 11.5 1.75 11.5H8.5V18.25C8.5 19.0797 9.17031 19.75 10 19.75C10.8297 19.75 11.5 19.0797 11.5 18.25V11.5H18.25C19.0797 11.5 19.75 10.8297 19.75 10C19.75 9.17031 19.0797 8.5 18.25 8.5H11.5V1.75Z"
									fill="#FCFCFC"
								/>
							</svg>
						</div>
						<div
							className={cls.notificationButton}
							onClick={() => setIsOpen(!isOpen)}>
							<div className={cls.textArrow}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="16"
									viewBox="0 0 14 16"
									fill="none">
									<g clipPath="url(#clip0_5_71364)">
										<path
											d="M13.7061 7.49434C14.0967 7.88496 14.0967 8.51934 13.7061 8.90996L8.70605 13.91C8.31543 14.3006 7.68105 14.3006 7.29043 13.91C6.8998 13.5193 6.8998 12.885 7.29043 12.4943L10.5873 9.20059H0.999804C0.446679 9.20059 -0.000195503 8.75371 -0.000195503 8.20059C-0.000195503 7.64746 0.446679 7.20059 0.999804 7.20059H10.5842L7.29355 3.90684C6.90293 3.51621 6.90293 2.88184 7.29355 2.49121C7.68418 2.10059 8.31855 2.10059 8.70918 2.49121L13.7092 7.49121L13.7061 7.49434Z"
											fill="#1E1E1E"
										/>
									</g>
									<defs>
										<clipPath id="clip0_5_71364">
											<rect width="14" height="16" fill="white" />
										</clipPath>
									</defs>
								</svg>
								<p className={cls['text-wrapper-3']}>
									Add a new collection to shared items
								</p>
							</div>
						</div>
						{isOpen && (
							<Dropdown
								onAdd={(collections) => {
									const newItems = [...collections, ...added];
									setAdded(newItems);
									setAddInfo(newItems);
									setIsOpen(false);
								}}
							/>
						)}
					</div>
				</div>
			</div>
			<SearchGrid
				api="collections/site-collections"
				title="shared collections from your digital library"
				share={shareInfo}
				add={addInfo}>
				{(results) => (
					<div className={cls.searchGrid}>
						{added.map((item) => (
							<CardShare
								key={`added-item-${item.id}`}
								data={item}
								title={item.name}
								isNew={true}
							/>
						))}
						{results.map((item) => (
							<CardShare
								key={`shared-item-${item.id}`}
								data={item}
								title={item.name}
							/>
						))}
					</div>
				)}
			</SearchGrid>
		</div>
	);
};
