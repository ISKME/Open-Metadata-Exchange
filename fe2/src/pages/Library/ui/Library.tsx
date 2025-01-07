// @ts-ignore
import {
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { classNames } from 'shared/lib/classNames/classNames';
import { useEffect, useState } from 'react';
import { Breadcrumb } from 'components/breadcrumb';
import cls from './Library.module.scss';
import { Tabs } from '../../../widgets/Tabs';
// import { Check } from 'components/check';
// import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
// import 'react-calendar/dist/Calendar.css';

interface LibraryProps {
  className?: string;
}

const styles = `
.react-daterange-picker {
  display: inline-flex;
  position: relative;
  font-family: Open Sans;
}

.react-daterange-picker,
.react-daterange-picker *,
.react-daterange-picker *:before,
.react-daterange-picker *:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.react-daterange-picker--disabled {
  background-color: #f0f0f0;
  color: #6d6d6d;
}

.react-daterange-picker__wrapper {
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #000;
  background: #FCFCFC;
}

.react-daterange-picker__inputGroup {
  min-width: calc((4px * 3) + 0.54em * 8 + 0.217em * 2);
  height: 100%;
  flex-grow: 1;
  padding: 0 2px;
  box-sizing: content-box;
}

.react-daterange-picker__inputGroup__divider {
  padding: 1px 0;
  white-space: pre;
}

.react-daterange-picker__inputGroup__divider,
.react-daterange-picker__inputGroup__leadingZero {
  display: inline-block;
}

.react-daterange-picker__inputGroup__input {
  min-width: 0.54em;
  height: 100%;
  position: relative;
  padding: 0 1px;
  border: 0;
  background: none;
  color: currentColor;
  font: inherit;
  box-sizing: content-box;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.1px;
  box-shadow: none;
}

.react-daterange-picker__inputGroup__input::-webkit-outer-spin-button,
.react-daterange-picker__inputGroup__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

.react-daterange-picker__inputGroup__input:invalid {
  background: rgba(255, 0, 0, 0.1);
}

.react-daterange-picker__inputGroup__input--hasLeadingZero {
  margin-left: -0.54em;
  padding-left: calc(1px + 0.54em);
}

.react-daterange-picker__button {
  border: 0;
  background: transparent;
  padding: 4px 6px;
}

.react-daterange-picker__button:enabled {
  cursor: pointer;
}

.react-daterange-picker__button:enabled:hover .react-daterange-picker__button__icon,
.react-daterange-picker__button:enabled:focus .react-daterange-picker__button__icon {
  stroke: #0078d7;
}

.react-daterange-picker__button:disabled .react-daterange-picker__button__icon {
  stroke: #6d6d6d;
}

.react-daterange-picker__button svg {
  display: inherit;
}

.react-daterange-picker__calendar {
  width: 350px;
  max-width: 100vw;
  z-index: 1;
}

.react-daterange-picker__calendar--closed {
  display: none;
}

.react-daterange-picker__calendar .react-calendar {
  border-width: thin;
}

.react-calendar {
  width: 350px;
  max-width: 100%;
  background: white;
  border: 1px solid #a0a096;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.125em;
}

.react-calendar--doubleView {
  width: 700px;
}

.react-calendar--doubleView .react-calendar__viewContainer {
  display: flex;
  margin: -0.5em;
}

.react-calendar--doubleView .react-calendar__viewContainer > * {
  width: 50%;
  margin: 0.5em;
}

.react-calendar,
.react-calendar *,
.react-calendar *:before,
.react-calendar *:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.react-calendar button {
  margin: 0;
  border: 0;
  outline: none;
}

.react-calendar button:enabled:hover {
  cursor: pointer;
}

.react-calendar__navigation {
  display: flex;
  height: 44px;
  margin-bottom: 1em;
}

.react-calendar__navigation button {
  min-width: 44px;
  background: none;
}

.react-calendar__navigation button:disabled {
  background-color: #f0f0f0;
}

.react-calendar__navigation button:enabled:hover,
.react-calendar__navigation button:enabled:focus {
  background-color: #e6e6e6;
}

.react-calendar__month-view__weekdays {
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.75em;
}

.react-calendar__month-view__weekdays__weekday {
  padding: 0.5em;
}

.react-calendar__month-view__weekNumbers .react-calendar__tile {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75em;
  font-weight: bold;
}

.react-calendar__month-view__days__day--weekend {
  color: #d10000;
}

.react-calendar__month-view__days__day--neighboringMonth {
  color: #757575;
}

.react-calendar__year-view .react-calendar__tile,
.react-calendar__decade-view .react-calendar__tile,
.react-calendar__century-view .react-calendar__tile {
  padding: 2em 0.5em;
}

.react-calendar__tile {
  max-width: 100%;
  padding: 10px 6.6667px;
  background: none;
  text-align: center;
  line-height: 16px;
}

.react-calendar__tile:disabled {
  background-color: #f0f0f0;
}

.react-calendar__tile:enabled:hover,
.react-calendar__tile:enabled:focus {
  background-color: #e6e6e6;
}

.react-calendar__tile--now {
  background: #ffff76;
}

.react-calendar__tile--now:enabled:hover,
.react-calendar__tile--now:enabled:focus {
  background: #ffffa9;
}

.react-calendar__tile--hasActive {
  background: #76baff;
}

.react-calendar__tile--hasActive:enabled:hover,
.react-calendar__tile--hasActive:enabled:focus {
  background: #a9d4ff;
}

.react-calendar__tile--active {
  background: #006edc;
  color: white;
}

.react-calendar__tile--active:enabled:hover,
.react-calendar__tile--active:enabled:focus {
  background: #1087ff;
}

.react-calendar--selectRange .react-calendar__tile--hover {
  background-color: #e6e6e6;
}
`;

const tabs = [
  {
    title: 'My Library',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12.2604 4.74757C12.1906 4.68081 12.0978 4.64355 12.0012 4.64355C11.9046 4.64355 11.8118 4.68081 11.742 4.74757L3.1123 12.9915C3.07566 13.0265 3.0465 13.0687 3.0266 13.1153C3.0067 13.162 2.99647 13.2122 2.99652 13.2629L2.99512 21.0001C2.99512 21.3979 3.15315 21.7794 3.43446 22.0607C3.71576 22.342 4.09729 22.5001 4.49512 22.5001H8.9998C9.19871 22.5001 9.38948 22.421 9.53013 22.2804C9.67078 22.1397 9.7498 21.949 9.7498 21.7501V15.3751C9.7498 15.2756 9.78931 15.1802 9.85964 15.1099C9.92996 15.0396 10.0253 15.0001 10.1248 15.0001H13.8748C13.9743 15.0001 14.0696 15.0396 14.14 15.1099C14.2103 15.1802 14.2498 15.2756 14.2498 15.3751V21.7501C14.2498 21.949 14.3288 22.1397 14.4695 22.2804C14.6101 22.421 14.8009 22.5001 14.9998 22.5001H19.5026C19.9004 22.5001 20.282 22.342 20.5633 22.0607C20.8446 21.7794 21.0026 21.3979 21.0026 21.0001V13.2629C21.0027 13.2122 20.9924 13.162 20.9725 13.1153C20.9526 13.0687 20.9235 13.0265 20.8868 12.9915L12.2604 4.74757Z" fill="#1E1E1E" />
        <path d="M23.0119 11.4455L19.5056 8.09113V3.00098C19.5056 2.80206 19.4266 2.6113 19.286 2.47065C19.1453 2.32999 18.9546 2.25098 18.7556 2.25098H16.5057C16.3067 2.25098 16.116 2.32999 15.9753 2.47065C15.8347 2.6113 15.7557 2.80206 15.7557 3.00098V4.50098L13.0407 1.90504C12.7866 1.64816 12.4088 1.50098 12.0005 1.50098C11.5936 1.50098 11.2167 1.64816 10.9627 1.90551L0.992381 11.4446C0.700819 11.7258 0.664256 12.1885 0.929568 12.4932C0.996192 12.5701 1.07777 12.6326 1.16933 12.677C1.2609 12.7214 1.36053 12.7467 1.46218 12.7513C1.56383 12.756 1.66536 12.7399 1.76059 12.704C1.85582 12.6682 1.94277 12.6134 2.01613 12.5428L11.7427 3.24848C11.8125 3.18172 11.9053 3.14446 12.0019 3.14446C12.0985 3.14446 12.1913 3.18172 12.2611 3.24848L21.9886 12.5428C22.1319 12.6803 22.3238 12.7553 22.5223 12.7514C22.7208 12.7475 22.9097 12.6651 23.0475 12.5222C23.3353 12.2241 23.3114 11.7319 23.0119 11.4455Z" fill="#1E1E1E" />
      </svg>
    ),
    content: null,
  },
  {
    title: 'Subscribed Content',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M2.23125 14.081L10.7016 21.9888C11.0531 22.317 11.5172 22.4998 12 22.4998C12.4828 22.4998 12.9469 22.317 13.2984 21.9888L21.7687 14.081C23.1938 12.7545 24 10.8935 24 8.9482V8.67633C24 5.39976 21.6328 2.60601 18.4031 2.06695C16.2656 1.7107 14.0906 2.40914 12.5625 3.93726L12 4.49976L11.4375 3.93726C9.90938 2.40914 7.73438 1.7107 5.59688 2.06695C2.36719 2.60601 0 5.39976 0 8.67633V8.9482C0 10.8935 0.80625 12.7545 2.23125 14.081Z" fill="#1E1E1E" />
      </svg>
    ),
    content: [
      {
        title: 'Search',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path d="M17.6828 10.0082C17.6828 11.5547 17.1808 12.9833 16.3351 14.1423L20.6006 18.4112C21.0218 18.8324 21.0218 19.5163 20.6006 19.9375C20.1795 20.3587 19.4955 20.3587 19.0743 19.9375L14.8088 15.6686C13.6498 16.5177 12.2212 17.0163 10.6747 17.0163C6.80333 17.0163 3.6665 13.8795 3.6665 10.0082C3.6665 6.13682 6.80333 3 10.6747 3C14.546 3 17.6828 6.13682 17.6828 10.0082ZM10.6747 14.86C11.3118 14.86 11.9427 14.7345 12.5314 14.4906C13.12 14.2468 13.6549 13.8894 14.1054 13.4389C14.5559 12.9884 14.9133 12.4535 15.1571 11.8649C15.401 11.2762 15.5265 10.6453 15.5265 10.0082C15.5265 9.37101 15.401 8.7401 15.1571 8.15145C14.9133 7.5628 14.5559 7.02795 14.1054 6.57741C13.6549 6.12688 13.12 5.7695 12.5314 5.52568C11.9427 5.28185 11.3118 5.15636 10.6747 5.15636C10.0375 5.15636 9.4066 5.28185 8.81796 5.52568C8.22931 5.7695 7.69445 6.12688 7.24392 6.57741C6.79339 7.02795 6.43601 7.5628 6.19218 8.15145C5.94835 8.7401 5.82286 9.37101 5.82286 10.0082C5.82286 10.6453 5.94835 11.2762 6.19218 11.8649C6.43601 12.4535 6.79339 12.9884 7.24392 13.4389C7.69445 13.8894 8.22931 14.2468 8.81796 14.4906C9.4066 14.7345 10.0375 14.86 10.6747 14.86Z" />
          </svg>
        ),
      },
      {
        title: 'Preferences',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0_220_4896)">
              <path d="M22.1063 1.01699C21.0797 -0.00957033 19.4203 -0.00957033 18.3937 1.01699L16.9828 2.42324L21.5719 7.01231L22.9828 5.60137C24.0094 4.5748 24.0094 2.91543 22.9828 1.88887L22.1063 1.01699ZM8.08125 11.3295C7.79531 11.6154 7.575 11.967 7.44844 12.3561L6.06094 16.5186C5.925 16.9217 6.03281 17.367 6.33281 17.6717C6.63281 17.9764 7.07812 18.0795 7.48594 17.9436L11.6484 16.5561C12.0328 16.4295 12.3844 16.2092 12.675 15.9232L20.5172 8.07637L15.9234 3.48262L8.08125 11.3295ZM4.5 2.9998C2.01562 2.9998 0 5.01543 0 7.4998V19.4998C0 21.9842 2.01562 23.9998 4.5 23.9998H16.5C18.9844 23.9998 21 21.9842 21 19.4998V14.9998C21 14.1701 20.3297 13.4998 19.5 13.4998C18.6703 13.4998 18 14.1701 18 14.9998V19.4998C18 20.3295 17.3297 20.9998 16.5 20.9998H4.5C3.67031 20.9998 3 20.3295 3 19.4998V7.4998C3 6.67012 3.67031 5.9998 4.5 5.9998H9C9.82969 5.9998 10.5 5.32949 10.5 4.4998C10.5 3.67012 9.82969 2.9998 9 2.9998H4.5Z" />
            </g>
            <defs>
              <clipPath id="clip0_220_4896">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
      {
        title: 'Updates',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
            <g clipPath="url(#clip0_220_4902)">
              <path d="M10.8331 0C10.0034 0 9.33309 0.670312 9.33309 1.5V2.4C5.91121 3.09375 3.33309 6.12187 3.33309 9.75V10.6313C3.33309 12.8344 2.52215 14.9625 1.05965 16.6125L0.712775 17.0016C0.319025 17.4422 0.225275 18.075 0.464337 18.6141C0.7034 19.1531 1.24246 19.5 1.83309 19.5H19.8331C20.4237 19.5 20.9581 19.1531 21.2018 18.6141C21.4456 18.075 21.3471 17.4422 20.9534 17.0016L20.6065 16.6125C19.144 14.9625 18.3331 12.8391 18.3331 10.6313V9.75C18.3331 6.12187 15.755 3.09375 12.3331 2.4V1.5C12.3331 0.670312 11.6628 0 10.8331 0ZM12.9565 23.1234C13.519 22.5609 13.8331 21.7969 13.8331 21H10.8331H7.83309C7.83309 21.7969 8.14715 22.5609 8.70965 23.1234C9.27215 23.6859 10.0362 24 10.8331 24C11.63 24 12.394 23.6859 12.9565 23.1234Z" />
            </g>
            <defs>
              <clipPath id="clip0_220_4902">
                <rect width="21" height="24" fill="white" transform="translate(0.333008)" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Shared Content',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="24" viewBox="0 0 21 24" fill="none">
        <path d="M18 1.5C19.6547 1.5 21 2.84531 21 4.5V19.5C21 21.1547 19.6547 22.5 18 22.5H3C1.34531 22.5 0 21.1547 0 19.5V4.5C0 2.84531 1.34531 1.5 3 1.5H18ZM15 14.6906V8.25C15 7.8375 14.6625 7.5 14.25 7.5H7.80938C7.22344 7.5 6.75 7.97344 6.75 8.55938C6.75 8.84063 6.8625 9.1125 7.05938 9.30938L8.625 10.875L5.51719 13.9828C5.34375 14.1562 5.25 14.3859 5.25 14.625C5.25 14.8641 5.34375 15.0938 5.51719 15.2672L7.2375 16.9875C7.40625 17.1562 7.63594 17.2547 7.87969 17.2547C8.12344 17.2547 8.34844 17.1609 8.52188 16.9875L11.625 13.875L13.1906 15.4406C13.3875 15.6375 13.6594 15.75 13.9406 15.75C14.5266 15.75 15 15.2766 15 14.6906Z" fill="#1E1E1E" />
      </svg>
    ),
    content: [
      {
        title: 'Search',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path d="M17.6828 10.0082C17.6828 11.5547 17.1808 12.9833 16.3351 14.1423L20.6006 18.4112C21.0218 18.8324 21.0218 19.5163 20.6006 19.9375C20.1795 20.3587 19.4955 20.3587 19.0743 19.9375L14.8088 15.6686C13.6498 16.5177 12.2212 17.0163 10.6747 17.0163C6.80333 17.0163 3.6665 13.8795 3.6665 10.0082C3.6665 6.13682 6.80333 3 10.6747 3C14.546 3 17.6828 6.13682 17.6828 10.0082ZM10.6747 14.86C11.3118 14.86 11.9427 14.7345 12.5314 14.4906C13.12 14.2468 13.6549 13.8894 14.1054 13.4389C14.5559 12.9884 14.9133 12.4535 15.1571 11.8649C15.401 11.2762 15.5265 10.6453 15.5265 10.0082C15.5265 9.37101 15.401 8.7401 15.1571 8.15145C14.9133 7.5628 14.5559 7.02795 14.1054 6.57741C13.6549 6.12688 13.12 5.7695 12.5314 5.52568C11.9427 5.28185 11.3118 5.15636 10.6747 5.15636C10.0375 5.15636 9.4066 5.28185 8.81796 5.52568C8.22931 5.7695 7.69445 6.12688 7.24392 6.57741C6.79339 7.02795 6.43601 7.5628 6.19218 8.15145C5.94835 8.7401 5.82286 9.37101 5.82286 10.0082C5.82286 10.6453 5.94835 11.2762 6.19218 11.8649C6.43601 12.4535 6.79339 12.9884 7.24392 13.4389C7.69445 13.8894 8.22931 14.2468 8.81796 14.4906C9.4066 14.7345 10.0375 14.86 10.6747 14.86Z" />
          </svg>
        ),
      },
      {
        title: 'Preferences',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0_220_4896)">
              <path d="M22.1063 1.01699C21.0797 -0.00957033 19.4203 -0.00957033 18.3937 1.01699L16.9828 2.42324L21.5719 7.01231L22.9828 5.60137C24.0094 4.5748 24.0094 2.91543 22.9828 1.88887L22.1063 1.01699ZM8.08125 11.3295C7.79531 11.6154 7.575 11.967 7.44844 12.3561L6.06094 16.5186C5.925 16.9217 6.03281 17.367 6.33281 17.6717C6.63281 17.9764 7.07812 18.0795 7.48594 17.9436L11.6484 16.5561C12.0328 16.4295 12.3844 16.2092 12.675 15.9232L20.5172 8.07637L15.9234 3.48262L8.08125 11.3295ZM4.5 2.9998C2.01562 2.9998 0 5.01543 0 7.4998V19.4998C0 21.9842 2.01562 23.9998 4.5 23.9998H16.5C18.9844 23.9998 21 21.9842 21 19.4998V14.9998C21 14.1701 20.3297 13.4998 19.5 13.4998C18.6703 13.4998 18 14.1701 18 14.9998V19.4998C18 20.3295 17.3297 20.9998 16.5 20.9998H4.5C3.67031 20.9998 3 20.3295 3 19.4998V7.4998C3 6.67012 3.67031 5.9998 4.5 5.9998H9C9.82969 5.9998 10.5 5.32949 10.5 4.4998C10.5 3.67012 9.82969 2.9998 9 2.9998H4.5Z" />
            </g>
            <defs>
              <clipPath id="clip0_220_4896">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
      {
        title: 'Updates',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
            <g clipPath="url(#clip0_220_4902)">
              <path d="M10.8331 0C10.0034 0 9.33309 0.670312 9.33309 1.5V2.4C5.91121 3.09375 3.33309 6.12187 3.33309 9.75V10.6313C3.33309 12.8344 2.52215 14.9625 1.05965 16.6125L0.712775 17.0016C0.319025 17.4422 0.225275 18.075 0.464337 18.6141C0.7034 19.1531 1.24246 19.5 1.83309 19.5H19.8331C20.4237 19.5 20.9581 19.1531 21.2018 18.6141C21.4456 18.075 21.3471 17.4422 20.9534 17.0016L20.6065 16.6125C19.144 14.9625 18.3331 12.8391 18.3331 10.6313V9.75C18.3331 6.12187 15.755 3.09375 12.3331 2.4V1.5C12.3331 0.670312 11.6628 0 10.8331 0ZM12.9565 23.1234C13.519 22.5609 13.8331 21.7969 13.8331 21H10.8331H7.83309C7.83309 21.7969 8.14715 22.5609 8.70965 23.1234C9.27215 23.6859 10.0362 24 10.8331 24C11.63 24 12.394 23.6859 12.9565 23.1234Z" />
            </g>
            <defs>
              <clipPath id="clip0_220_4902">
                <rect width="21" height="24" fill="white" transform="translate(0.333008)" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
    ],
  },
];

const checker = (path) => window.location.pathname.startsWith(path);

export function Library({ className }: LibraryProps) {
  const [middle, setMiddle] = useState('');
  const [last, setlast] = useState('');
  const [index, setIndex] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);

    if (checker('/imls/site-collections/subscribed-collections')) {
      setMiddle('Subscribed Content');
      setlast('Search');
    } else if (checker('/imls/site-collections/shared-collections')) {
      setMiddle('Shared Content');
      setlast('Search');
    } else if (checker('/imls/site-collections/shared-preferences')) {
      setMiddle('Shared Content');
      setlast('Preferences');
    } else if (checker('/imls/site-collections/subscribed-preferences')) {
      setMiddle('Subscribed Content');
      setlast('Preferences');
    } else if (checker('/imls/site-collections/subscribed-updates')) {
      setMiddle('Subscribed Content');
      setlast('Updates');
    } else if (checker('/imls/site-collections/shared-updates')) {
      setMiddle('Shared Content');
      setlast('Updates');
    } else {
      setMiddle('');
      setlast('');
    }
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/imls/site-collections/main')) {
      setMiddle('');
      setlast('');
    } else if (location.pathname.startsWith('/imls/site-collections/subscribed-collections')) {
      setIndex(index + 1);
      setMiddle('Subscribed Content');
      setlast('Search');
    } else if (location.pathname.startsWith('/imls/site-collections/shared-collections')) {
      setIndex(index + 1);
      setMiddle('Shared Content');
      setlast('Search');
    }
  }, [location]);

  return (
    <div className={classNames(cls.library_wrapper, {}, [className])}>
      <div className={cls['breadcrumb']}>
        <Breadcrumb
          first="Library"
          middle={middle}
          last={last}
          onChange={() => {
            setIndex(index + 1);
          }}
        />
      </div>
      <div id="my_library" className={cls.library}>
        {/* <ArrowIcon className={cls.back_link_img} />
        <AppLink to="/imls/explore-oer-exchange" aria-label="Go Back to Explore Open Metadata Exchange" className={cls.back_link} text="Back to Explore Open Metadata Exchange" />
        <h1 className={cls.library_title}>My Library</h1> */}
        <Tabs
          key={index}
          tabs={tabs}
          onChange={(i, j) => {
            if (i === 0) {
              navigate('/imls/site-collections/main');
              setMiddle('');
              setlast('');
            } else if (i === 1 && j === 0) {
              navigate('/imls/site-collections/subscribed-collections');
              setMiddle('Subscribed Content');
              setlast('Search');
            } else if (i === 2 && j === 0) {
              navigate('/imls/site-collections/shared-collections');
              setMiddle('Shared Content');
              setlast('Search');
            } else if (i === 2 && j === 1) {
              navigate('/imls/site-collections/shared-preferences');
              setMiddle('Shared Content');
              setlast('Preferences');
            } else if (i === 1 && j === 1) {
              navigate('/imls/site-collections/subscribed-preferences');
              setMiddle('Subscribed Content');
              setlast('Preferences');
            } else if (i === 1 && j === 2) {
              navigate('/imls/site-collections/subscribed-updates');
              setMiddle('Subscribed Content');
              setlast('Updates');
            } else if (i === 2 && j === 2) {
              navigate('/imls/site-collections/shared-updates');
              setMiddle('Shared Content');
              setlast('Updates');
            }
          }}
        />
        <div className={cls.outlet}>
          <Outlet />
        </div>

        {/* <Routes>
          <Route index element={<SubscribedContent />} />
        </Routes> */}
      </div>
    </div>
  );
}
