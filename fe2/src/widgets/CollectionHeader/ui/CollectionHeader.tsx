/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'shared/ui/Button/Button';
import { useNavigate } from 'react-router-dom';
import cls from './CollectionHeader.module.scss';

function checkOverflow(el) {
	const curOverflow = el.style.overflow;
	// eslint-disable-next-line no-param-reassign
	if (!curOverflow || curOverflow === 'visible') el.style.overflow = 'hidden';
	const isOverflowing =
		el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
	// eslint-disable-next-line no-param-reassign
	el.style.overflow = curOverflow;
	return isOverflowing;
}

export const CollectionHeader = ({
	id,
	name,
	micrositeName,
	micrositeSlug,
	numResources,
	educationLevels,
	updatedOn,
	thumbnail,
	abstract,
	subscribed,
	className,
	onDone = () => {},
}: any) => {
	const navigator = useNavigate();
	const [sub, setSub] = useState(subscribed);
	const [more, setMore] = useState(true);
	useEffect(() => {
		if (abstract) setMore(checkOverflow(document.getElementById('compress')));
	}, [abstract]);
	useEffect(() => {
		setSub(subscribed);
	}, [subscribed]);
	const subscribing = async () => {
		setSub(true);
		await axios.post(
			`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/${micrositeSlug}/${id}/subscribe`
		);
		onDone();
		// navigator('/imls/site-collections/subscribed-collections');
	};
	return (
		<div style={{ marginBottom: '34px' }}>
			<div className={cls.collection_header}>
				<div>
					<img src={thumbnail} alt={name} />
				</div>
				<div>
					<div>
						<h1>{name}</h1>
						{`${numResources} resources`}
					</div>
					<div>
						{!sub && (
							<Button
								className={cls.button}
								title="Subscribe"
								onClick={subscribing}
							/>
						)}
						{sub && (
							<Button
								className={cls.buttonSub}
								title="✓ Subscribed to My Library"
							/>
						)}
						{/* onClick={() => setSub(false)} */}
					</div>
					<div className={cls.desc}>
						<div>
							<h4>
								About{' '}
								<a href={`/imls/microsite/${micrositeSlug}`}>{micrositeName}</a>
								:
							</h4>
							<p>
								{`${
									micrositeName || ''
								} is an OER dynamic digital library and network.`}
							</p>
							<h4>Education Level:</h4>
							<span className={cls.shorten}>
								{educationLevels?.slice(0, 3)?.join(', ')}
							</span>
						</div>
						<div>
							<h4>Last Updated:</h4>
							{new Date(updatedOn).toDateString().substring(4)}
						</div>
					</div>
				</div>
			</div>
			<h4>Overview:</h4>
			{/* eslint-disable-next-line react/no-danger */}
			<div style={{ position: 'relative' }}>
				<div
					id="compress"
					className={more && cls.compress}
					dangerouslySetInnerHTML={{ __html: abstract }}
				/>
				{more && (
					<span className={cls.overview_link} onClick={() => setMore(false)}>
						Read More
					</span>
				)}
			</div>
		</div>
	);
};
