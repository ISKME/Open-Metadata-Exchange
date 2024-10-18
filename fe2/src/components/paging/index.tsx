// @ts-nocheck
/* eslint-disable */
import { SyncPaging } from './sync';
import { AsyncPaging } from './async';
import { AsyncQueryPaging } from './query';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';

const style = {
	borderRadius: '10px',
	background: '#fff',
	boxShadow: '5px 5px 22px #ababab, -5px -5px 22px #ffffff',
	// fontWeight: 'bold',
	boxSizing: 'border-box',
	padding: '8px 12px',
	border: 'none',
	cursor: 'pointer',
	margin: '8px',
};

function Button({ children, onClick, selected }) {
	const selectedStyle = selected
		? { background: 'rgb(55, 58, 72)', color: 'white' }
		: {};
	return (
		<button style={{ ...style, ...selectedStyle }} onClick={onClick}>
			{children}
		</button>
	);
}

const fetchPath =
	(path, callback) =>
	(pageNumber: number, pageSize: number = 9) =>
		new Promise((resolve) => {
			// const url = new URL(window.location.origin + '/api/imls/v2/' + path);
			const url = new URL(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/${path}`
			);
			// url.searchParams.sort();
			// if (key === 0 || url.searchParams.toString() !== new URL(window.location.href).searchParams.toString()) {
			url.searchParams.set('per_page', pageSize || 9);
			url.searchParams.set('page', pageNumber + 1);
			axios.get(url.toString()).then(({ data }) => {
				const { items, pagination, filters, sortByOptions } = data.collections;
				callback(pagination.count, filters, sortByOptions);
				resolve([items.map((item) => JSON.stringify(item))]);
			});
		});

// const content = (items, { currentPage, pageCount, pages }, { goto, back, next, first, last }) => (
//   <div>
//     <ul style={styles}>{items.map((i) => <li>{children ? children(i) : i}</li>)}</ul>
//     {itemCount / pageSize > 1 && <div>
//       <Button onClick={first}>&lt;&lt;</Button>
//       <Button onClick={back}>&lt;</Button>
//       {(currentPage >= 4) && <Button onClick={first}>1</Button>}
//       {(currentPage > 4) && <span>...</span>}
//       {pages.map((p) => (Math.abs(currentPage - p) < 4) && <Button onClick={() => goto(p)} key={p}>{p === currentPage ? <b>{p + 1}</b> : p + 1}</Button>)}
//       {(pageCount - currentPage > 5) && <span>...</span>}
//       {(pageCount - currentPage >= 5) && <Button onClick={last}>{pageCount}</Button>}
//       <Button onClick={next}>&gt;</Button>
//       <Button onClick={last}>&gt;&gt;</Button>
//     </div>}
//   </div>
// )

const usePrevious = <T extends unknown>(value: T): T | undefined => {
	const ref = useRef<T>();
	useEffect(() => {
		ref.current = value;
	});
	return ref.current;
};

export const Paging = ({
	path = '',
	items = null,
	query = false,
	children = null,
	itemCount = 11,
	pageSize = 9,
	styles = {},
	done = (count, filters, sortByOptions) => {},
}) => {
	const prevAmount = usePrevious({ path });
	const Component = query ? AsyncQueryPaging : AsyncPaging;
	const fetchPage = fetchPath(path, done);
	const [key, setKey] = useState(0);
	useEffect(() => {
		console.log(prevAmount?.path, path);
		if (prevAmount && prevAmount?.path?.path !== path) setKey(key + 1);
	}, [path]);
	if (path)
		return (
			<div>
				<Component
					fetchPage={fetchPage}
					pageSize={pageSize}
					itemCount={itemCount}
					items={items}
					key={key}>
					{(
						items,
						{ currentPage, pageCount, pages },
						{ goto, back, next, first, last }
					) => (
						<div>
							{/* key={children ? children(i).key : i} */}
							<ul style={styles}>
								{items.map((i) => (
									<li>{children ? children(i) : i}</li>
								))}
							</ul>
							{itemCount / pageSize > 1 && (
								<div>
									<Button onClick={first}>&lt;&lt;</Button>
									<Button onClick={back}>&lt;</Button>
									{currentPage >= 4 && <Button onClick={first}>1</Button>}
									{currentPage > 4 && <span>...</span>}
									{pages.map(
										(p) =>
											Math.abs(currentPage - p) < 4 && (
												<Button
													onClick={() => goto(p)}
													key={p}
													selected={p === currentPage}>
													{p === currentPage ? <b>{p + 1}</b> : p + 1}
												</Button>
											)
									)}
									{pageCount - currentPage > 5 && <span>...</span>}
									{pageCount - currentPage >= 5 && (
										<Button onClick={last}>{pageCount}</Button>
									)}
									<Button onClick={next}>&gt;</Button>
									<Button onClick={last}>&gt;&gt;</Button>
								</div>
							)}
						</div>
					)}
				</Component>
			</div>
		);
	return (
		<div>
			<SyncPaging items={items}>
				{(
					items,
					{ currentPage, pageCount, pages },
					{ goto, back, next, first, last }
				) => (
					<div>
						<ul style={styles}>
							{items.map((i) => (
								<li>{children ? children(i) : i}</li>
							))}
						</ul>
						{itemCount / pageSize > 1 && (
							<div>
								<Button onClick={first}>&lt;&lt;</Button>
								<Button onClick={back}>&lt;</Button>
								{currentPage >= 4 && <Button onClick={first}>1</Button>}
								{currentPage > 4 && <span>...</span>}
								{pages.map(
									(p) =>
										Math.abs(currentPage - p) < 4 && (
											<Button
												onClick={() => goto(p)}
												key={p}
												selected={p === currentPage}>
												{p === currentPage ? <b>{p + 1}</b> : p + 1}
											</Button>
										)
								)}
								{pageCount - currentPage > 5 && <span>...</span>}
								{pageCount - currentPage >= 5 && (
									<Button onClick={last}>{pageCount}</Button>
								)}
								<Button onClick={next}>&gt;</Button>
								<Button onClick={last}>&gt;&gt;</Button>
							</div>
						)}
					</div>
				)}
			</SyncPaging>
		</div>
	);
};
