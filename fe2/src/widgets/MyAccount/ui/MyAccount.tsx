import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	Typography,
	Button,
	TextField,
	Container,
	Grid,
	Alert,
	Checkbox,
} from '@mui/material';
import cls from './MyAccount.module.scss';
import { Link } from 'react-router-dom';

interface ErrorState {
	old_password?: string;
	new_password?: string;
	confirm_new_password?: string;
}

export function MyAccount() {
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		email: '',
		avatar: null,
		old_password: '',
		new_password: '',
		confirm_new_password: '',
		delete_image: false,
	});

	const [csrfToken, setCsrfToken] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [currentProfileImage, setCurrentProfileImage] = useState('');
	const [errors, setErrors] = useState<ErrorState>({});

	const endpoint = process.env.REACT_APP_API_URL;

	useEffect(() => {
		axios
			.get(`${endpoint}/api/csrf-token/`)
			.then((response) => {
				setCsrfToken(response.data.token);
				return axios.get(`${endpoint}/api/users/v1/profile/edit/`);
			})
			.then((response) => {
				const { user, profile } = response.data;
				setFormData({
					first_name: user.first_name,
					last_name: user.last_name,
					email: user.email,
					avatar: null,
					old_password: '',
					new_password: '',
					confirm_new_password: '',
					delete_image: false,
				});
				setCurrentProfileImage(user.avatar_url);
			})
			.catch((error) => {
				console.error('Error fetching user data or CSRF token:', error);
			});
	}, []);

	const handleInputChange = (event) => {
		const { name, value, type, checked } = event.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleFileChange = (event) => {
		setFormData({ ...formData, avatar: event.target.files[0] });
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		const { old_password, new_password, confirm_new_password } = formData;
		let newErrors: ErrorState = {};

		if (old_password || new_password || confirm_new_password) {
			if (!old_password) {
				newErrors.old_password = 'This field is required.';
			}
			if (!new_password) {
				newErrors.new_password = 'This field is required.';
			}
			if (!confirm_new_password) {
				newErrors.confirm_new_password = 'This field is required.';
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		} else {
			setErrors({});
		}

		const form = new FormData();
		form.append('first_name', formData.first_name);
		form.append('last_name', formData.last_name);
		form.append('email', formData.email);
		if (formData.avatar) {
			form.append('avatar', formData.avatar);
		}
		form.append('delete_image', formData.delete_image ? 'true' : 'false');
		form.append('old_password', formData.old_password);
		form.append('new_password', formData.new_password);
		form.append('confirm_new_password', formData.confirm_new_password);

		axios
			.post(`${endpoint}/api/users/v1/profile/edit/`, form, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'X-CSRFToken': csrfToken,
				},
			})
			.then((response) => {
				setSuccessMessage(response.data.message || 'Your account was updated.');
				setCurrentProfileImage('');
				setErrorMessage('');
				const { user, profile } = response.data;
				setFormData({
					first_name: user.first_name,
					last_name: user.last_name,
					email: user.email,
					avatar: null,
					old_password: '',
					new_password: '',
					confirm_new_password: '',
					delete_image: false,
				});
				setCurrentProfileImage(user.avatar_url);
			})
			.catch((error) => {
				if (
					error.response &&
					error.response.data &&
					error.response.data.errors
				) {
					const errors = error.response.data.errors;
					let errorMsg = 'Please correct the indicated errors:\n';
					if (errors.user_errors) {
						for (let key in errors.user_errors) {
							errorMsg += `${key}: ${errors.user_errors[key]}\n`;
						}
					}
					if (errors.profile_errors) {
						for (let key in errors.profile_errors) {
							errorMsg += `${key}: ${errors.profile_errors[key]}\n`;
						}
					}
					setErrorMessage(errorMsg);
				} else {
					setErrorMessage('An error occurred while updating your profile.');
				}
				setSuccessMessage('');
				console.error('Error updating profile:', error);
			});
	};

	return (
		<div className={`${cls['parent-container']}`}>
			<div
				className={`container-fluid page-description js-page-description ${cls['page-description']}`}>
				<div className={`container ${cls['page-description-title-container']}`}>
					<h1 className={`${cls['page-description-title']}`}>My Account</h1>
				</div>
			</div>
			<div className={`${cls['container']}`}>
				<div className="row">
					<div className="col-md-4">
						<nav className={`${cls['sidebar-navigation']}`}>
							<ul>
								<li>
									<i className="fa fa-chevron-right"></i>
									<Link to="/new/my/account/" className={`${cls['active']}`}>
										Account Settings
									</Link>
								</li>
								<hr />
								<li>
									<Link to="/new/my/default-organization">Organizations</Link>
								</li>
							</ul>
						</nav>
					</div>
					<div className="col-md-8">
						<div className={`${cls['message-text']}`}>
							{successMessage && (
								<Alert severity="success">{successMessage}</Alert>
							)}
							{errorMessage && <Alert severity="error">{errorMessage}</Alert>}
						</div>
						<h1 className={`${cls['page-title']}`}>Account Settings</h1>
						<Container maxWidth="md">
							<form onSubmit={handleSubmit} encType="multipart/form-data">
								<Grid container spacing={2}>
									<Grid item xs={12} className={`${cls['grid-form']}`}>
										<TextField
											label="First name"
											name="first_name"
											variant="outlined"
											fullWidth
											required
											value={formData.first_name}
											onChange={handleInputChange}
										/>
									</Grid>
									<Grid item xs={12} className={`${cls['grid-form']}`}>
										<TextField
											label="Last name"
											name="last_name"
											variant="outlined"
											fullWidth
											required
											value={formData.last_name}
											onChange={handleInputChange}
										/>
									</Grid>
									<Grid item xs={12} className={`${cls['grid-form']}`}>
										<TextField
											label="Email"
											name="email"
											variant="outlined"
											fullWidth
											required
											type="email"
											value={formData.email}
											onChange={handleInputChange}
										/>
									</Grid>
									<Grid item xs={12} className={`${cls['form-header']}`}>
										<Typography>
											{currentProfileImage
												? 'Change profile image'
												: 'Create profile image'}
										</Typography>
										<div className={`${cls['account-avatar']}`}>
											<input
												accept="image/*"
												id="avatar"
												onChange={handleFileChange}
												name="avatar"
												type="file"
											/>
										</div>

										{currentProfileImage && (
											<div className={`${cls['account-image']}`}>
												<img src={currentProfileImage} alt="Profile" />
												<div>
													<Checkbox
														name="delete_image"
														checked={formData.delete_image}
														onChange={handleInputChange}
													/>
													<label htmlFor="delete_image">Delete image</label>
												</div>
											</div>
										)}
									</Grid>
									<Grid item xs={12} className={`${cls['form-header']}`}>
										<Typography>Change password</Typography>
									</Grid>
									<Grid item xs={12} className={`${cls['grid-form']}`}>
										<TextField
											label="Old password"
											name="old_password"
											variant="outlined"
											fullWidth
											type="password"
											value={formData.old_password}
											onChange={handleInputChange}
											className={`${cls['input-parent']}`}
											autoComplete="new-password"
											error={!!errors.old_password}
											helperText={errors.old_password}
										/>
									</Grid>
									<Grid item xs={12} className={`${cls['grid-form']}`}>
										<TextField
											label="New password"
											name="new_password"
											variant="outlined"
											fullWidth
											type="password"
											value={formData.new_password}
											onChange={handleInputChange}
											className={`${cls['input-parent']}`}
											error={!!errors.new_password}
											helperText={errors.new_password}
										/>
									</Grid>
									<Grid item xs={12} className={`${cls['grid-form']}`}>
										<TextField
											label="Confirm new password"
											name="confirm_new_password"
											variant="outlined"
											fullWidth
											type="password"
											value={formData.confirm_new_password}
											onChange={handleInputChange}
											className={`${cls['input-parent']}`}
											error={!!errors.confirm_new_password}
											helperText={errors.confirm_new_password}
										/>
									</Grid>
									<Grid item xs={12}>
										<Button
											className="btn btn-primary"
											type="submit"
											variant="contained"
											color="primary">
											Save Changes
										</Button>
										<Button href="/new/my/account/" variant="text">
											Cancel
										</Button>
									</Grid>
								</Grid>
							</form>
						</Container>
					</div>
				</div>
			</div>
		</div>
	);
}
