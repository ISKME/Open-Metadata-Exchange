// @ts-ignore
import { Collapse } from 'widgets/Collapse';
import cls from './SubscribedUpdates.module.scss';

interface SubscribedUpdatesProps {
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

export function SubscribedUpdates({ className }: SubscribedUpdatesProps) {
  return (
    <div className={cls.updatesData}>
      <div>
        <div className={cls.latest}>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="24" viewBox="0 0 21 24" fill="none">
              <g clipPath="url(#clip0_131_23027)">
                <path d="M10.5001 0C9.67039 0 9.00008 0.670312 9.00008 1.5V2.4C5.5782 3.09375 3.00008 6.12187 3.00008 9.75V10.6313C3.00008 12.8344 2.18914 14.9625 0.726642 16.6125L0.379767 17.0016C-0.0139832 17.4422 -0.107733 18.075 0.131329 18.6141C0.370392 19.1531 0.909454 19.5 1.50008 19.5H19.5001C20.0907 19.5 20.6251 19.1531 20.8688 18.6141C21.1126 18.075 21.0141 17.4422 20.6204 17.0016L20.2735 16.6125C18.811 14.9625 18.0001 12.8391 18.0001 10.6313V9.75C18.0001 6.12187 15.422 3.09375 12.0001 2.4V1.5C12.0001 0.670312 11.3298 0 10.5001 0ZM12.6235 23.1234C13.186 22.5609 13.5001 21.7969 13.5001 21H10.5001H7.50008C7.50008 21.7969 7.81414 22.5609 8.37664 23.1234C8.93914 23.6859 9.7032 24 10.5001 24C11.297 24 12.061 23.6859 12.6235 23.1234Z" fill="#1747A1" />
              </g>
              <defs>
                <clipPath id="clip0_131_23027">
                  <rect width="21" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div>
            <em>
              <b>4</b>
              {' '}
              updates
            </em>
            <span>since your last session</span>
          </div>
        </div>
        <div className={cls.stay}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.17 14.76L15.07 13.66C15.78 12.33 15.6 10.65 14.48 9.53C13.79 8.84 12.9 8.5 12 8.5C11.97 8.5 11.94 8.51 11.91 8.51L13 9.6L11.94 10.66L9.11 7.83L11.94 5L13 6.06L12.04 7.02C13.31 7.03 14.57 7.5 15.54 8.46C17.24 10.17 17.45 12.82 16.17 14.76ZM14.89 16.17L12.06 19L11 17.94L11.95 16.99C10.69 16.98 9.43 16.49 8.47 15.53C6.76 13.82 6.55 11.18 7.83 9.24L8.93 10.34C8.22 11.67 8.4 13.35 9.52 14.47C10.22 15.17 11.15 15.51 12.08 15.48L11 14.4L12.06 13.34L14.89 16.17Z" fill="#1747A1" />
          </svg>
          <h5>Stay updated on what’s new</h5>
          <p>
            We’ll send you an email digest
            <br />
            of all of your notified updates.
          </p>
          <button>Manage email frequency</button>
        </div>
      </div>
      <div>
        <a href="#">Expand All Updates</a>
        <a href="#">Clear update notifications</a>
      </div>
      <div className={cls.gridCollapses}>
        <Collapse number={1} title="Content Additions">
          <div className={cls.collapseContent}>
            <CardItem />
            <span>View collection</span>
          </div>
        </Collapse>
        <Collapse number={1} title="Engagements">
          <div className={cls.collapseContent}>
            <CardItem />
            <span>View collection</span>
          </div>
        </Collapse>
        <Collapse number={1} title="Version updated">
          <div className={cls.collapseContent}>
            <CardItem />
            <span>View collection</span>
          </div>
        </Collapse>
        <Collapse number={1} title="URL updated">
          <div className={cls.collapseContent}>
            <CardItem />
            <span>View collection</span>
          </div>
        </Collapse>
        <Collapse number={1} title="Deaccessioned">
          <div className={`${cls.collapseContent} ${cls.left}`}>
            <CardItem />
            <span>View collection</span>
          </div>
        </Collapse>
        <Collapse number={0} title="Metadata updates" />
      </div>
    </div>
  );
}
