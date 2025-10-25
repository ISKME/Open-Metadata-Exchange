// @ts-ignore
import {
  useNavigate,
} from 'react-router-dom';
import cls from './LibraryContent.module.scss';

interface LibraryContentProps {
  className?: string;
}

const CardItem = () => (
  <div className={cls.cardItem}>
    <div className={cls.cardItemHeader}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
        <g clipPath="url(#clip0_5_59298)">
          <path d="M9.48718 0.480469C8.81514 0.480469 8.27218 1.02342 8.27218 1.69547V2.42447C5.50046 2.98641 3.41218 5.43919 3.41218 8.37797V9.09178C3.41218 10.8763 2.75532 12.6001 1.5707 13.9366L1.28973 14.2517C0.970793 14.6086 0.894855 15.1212 1.0885 15.5579C1.28214 15.9945 1.71878 16.2755 2.19718 16.2755H16.7772C17.2556 16.2755 17.6884 15.9945 17.8859 15.5579C18.0833 15.1212 18.0036 14.6086 17.6846 14.2517L17.4037 13.9366C16.219 12.6001 15.5622 10.8801 15.5622 9.09178V8.37797C15.5622 5.43919 13.4739 2.98641 10.7022 2.42447V1.69547C10.7022 1.02342 10.1592 0.480469 9.48718 0.480469ZM11.2072 19.2105C11.6628 18.7548 11.9172 18.1359 11.9172 17.4905H9.48718H7.05718C7.05718 18.1359 7.31157 18.7548 7.7672 19.2105C8.22282 19.6661 8.84171 19.9205 9.48718 19.9205C10.1327 19.9205 10.7515 19.6661 11.2072 19.2105Z" fill="white" />
        </g>
        <defs>
          <clipPath id="clip0_5_59298">
            <rect width="17.01" height="19.44" fill="white" transform="translate(0.981934 0.480469)" />
          </clipPath>
        </defs>
      </svg>
      <span>Resource deaccessioned</span>
    </div>
    <div className={cls.cardItemCover}>
      <img src="https://ynet-pic1.yit.co.il/picserver5/wcm_upload/2023/02/16/H1ueKos6j/shutterstock_2213684645.jpg" alt="" />
      <span>Literature Bests</span>
    </div>
    <div className={cls.cardItemContent}>
      <h6>M.O.S.T.</h6>
      <span>PreK-12, HigherEd, Continuing Ed</span>
      <br />
      <span>15 resources</span>
    </div>
  </div>
);

export function LibraryContent({ className }: LibraryContentProps) {
  const navigate = useNavigate();
  return (
    <>
      <section className={cls.common}>
        <h1>Your library is the place to manage:</h1>
        <div>
          <div onClick={() => { navigate('/imls/site-collections/subscribed-collections') }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2.23125 14.081L10.7016 21.9888C11.0531 22.317 11.5172 22.4998 12 22.4998C12.4828 22.4998 12.9469 22.317 13.2984 21.9888L21.7687 14.081C23.1938 12.7545 24 10.8935 24 8.9482V8.67633C24 5.39976 21.6328 2.60601 18.4031 2.06695C16.2656 1.7107 14.0906 2.40914 12.5625 3.93726L12 4.49976L11.4375 3.93726C9.90938 2.40914 7.73438 1.7107 5.59688 2.06695C2.36719 2.60601 0 5.39976 0 8.67633V8.9482C0 10.8935 0.80625 12.7545 2.23125 14.081Z" fill="#1E1E1E" />
            </svg>
            <h3>Subscribed Content</h3>
            <p>
              The content you subscribe to
              that syncs to your microsite.
            </p>
          </div>
          <div onClick={() => { navigate('/imls/site-collections/shared-collections') }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
              <g clipPath="url(#clip0_127_29626)">
                <path d="M18.5 1.5C20.1547 1.5 21.5 2.84531 21.5 4.5V19.5C21.5 21.1547 20.1547 22.5 18.5 22.5H3.5C1.84531 22.5 0.5 21.1547 0.5 19.5V4.5C0.5 2.84531 1.84531 1.5 3.5 1.5H18.5ZM15.5 14.6906V8.25C15.5 7.8375 15.1625 7.5 14.75 7.5H8.30938C7.72344 7.5 7.25 7.97344 7.25 8.55938C7.25 8.84063 7.3625 9.1125 7.55938 9.30938L9.125 10.875L6.01719 13.9828C5.84375 14.1562 5.75 14.3859 5.75 14.625C5.75 14.8641 5.84375 15.0938 6.01719 15.2672L7.7375 16.9875C7.90625 17.1562 8.13594 17.2547 8.37969 17.2547C8.62344 17.2547 8.84844 17.1609 9.02188 16.9875L12.125 13.875L13.6906 15.4406C13.8875 15.6375 14.1594 15.75 14.4406 15.75C15.0266 15.75 15.5 15.2766 15.5 14.6906Z" fill="#1E1E1E" />
              </g>
              <defs>
                <clipPath id="clip0_127_29626">
                  <rect width="21" height="24" fill="white" transform="translate(0.5)" />
                </clipPath>
              </defs>
            </svg>
            <h3>Shared Content</h3>
            <p>
              The content you share that others
              can sync to their microsites.
            </p>
          </div>
        </div>
      </section>
      <div className={cls.recently}>
        <div>
          <h4>
            Recently updated
            <br />
            subscribed collections
          </h4>
          <a href="#">View all updates to your subscribed collections</a>
        </div>
        <div>
          <CardItem />
          <CardItem />
        </div>
      </div>
    </>
  );
}
