import {
  memo, useState, useRef, useEffect,
} from 'react';
import { NavLink } from 'react-router-dom';
import { classNames } from 'shared/lib/classNames/classNames';
import cls from './Tabs.module.scss';
import { clickOnEnterOrSpace } from 'shared/lib/a11y/clickOnEnterOrSpace';

interface TabsProps {
    className?: string;
    style?: any;
    children?: any;
    tabs?: any;
    onChange?: any;
}

const checker = (path) => window.location.pathname.startsWith(path);

export const Tabs = memo(({
  className, style: styleProp, tabs, children, onChange: onChangeProp,
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const tabsRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const style = styleProp || {};

  const onChange = onChangeProp || (() => {});

  useEffect(() => {
    const checkArrows = () => {
      const tabsContainer = tabsRef.current;
      // if (tabsContainer.scrollWidth > tabsContainer.clientWidth) {
      if (tabsContainer.clientWidth <= 480) {
        setShowArrows(true);
      } else {
        setShowArrows(false);
      }
    };

    window.addEventListener('resize', checkArrows);
    checkArrows();

    if (checker('/imls/site-collections/subscribed-collections')) {
      setActiveTab(1);
    } else if (checker('/imls/site-collections/shared-collections')) {
      setActiveTab(2);
    } else if (checker('/imls/site-collections/shared-preferences')) {
      setActiveTab(2);
      setActiveSubTab(1);
    } else if (checker('/imls/site-collections/subscribed-preferences')) {
      setActiveTab(1);
      setActiveSubTab(1);
    } else if (checker('/imls/site-collections/subscribed-updates')) {
      setActiveTab(1);
      setActiveSubTab(2);
    } else if (checker('/imls/site-collections/shared-updates')) {
      setActiveTab(2);
      setActiveSubTab(2);
    }

    return () => {
      window.removeEventListener('resize', checkArrows);
    };
  }, []);

  const handleArrowClick = (direction) => {
    const tabsContainer = tabsRef.current;
    const containerWidth = tabsContainer.clientWidth;
    const { scrollWidth } = tabsContainer;

    let newPosition;

    if (direction === 'prev') {
      newPosition = scrollPosition - containerWidth;
      if (newPosition < 0) {
        newPosition = 0;
      }
    } else if (direction === 'next') {
      newPosition = scrollPosition + containerWidth;
      if (newPosition > scrollWidth - containerWidth) {
        newPosition = scrollWidth - containerWidth;
      }
    }

    tabsContainer.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });

    setScrollPosition(newPosition);
  };

  return (
    <div style={{ ...style, position: 'relative' }}>
      {showArrows && (
        <div className={cls.arrows}>
          <button
            type="button"
            className={`${cls.arrow} ${cls.prev} ${scrollPosition === 0 ? cls.disabled : ''}`}
            onClick={() => handleArrowClick('prev')}
          >
            &lt;
          </button>
          <button
            type="button"
            className={`${cls.arrow} ${cls.next} ${tabsRef.current && scrollPosition === tabsRef.current.scrollWidth - tabsRef.current.clientWidth ? cls.disabled : ''}`}
            onClick={() => handleArrowClick('next')}
          >
            &gt;
          </button>
        </div>
      )}
      <div className={cls.tabs} ref={tabsRef}>
        {tabs.map((tab, index) => (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={clickOnEnterOrSpace}
            // eslint-disable-next-line react/no-array-index-key -- the tabs come from props and the active tab is tracked by position too
            key={index}
            className={`${cls.tab} ${activeTab === index ? cls.active : ''}`}
            onClick={() => {
              setActiveTab(index);
              setActiveSubTab(0);
              onChange(index, 0);
            }}
          >
            {tab.icon}
            {tab.title}
          </div>
        ))}
        <div
          className={cls.line}
          style={{
            transform: `translateX(${activeTab * 100}%)`,
            width: `calc(100% / ${tabs.length})`,
          }}
        />
      </div>
      <div className={cls.content}>
        {/* {tabs[activeTab].content} */}
        {/* {children} */}
        {tabs[activeTab].content && (
          <div className={cls.actions}>
            {tabs[activeTab].content.map((item, index) => (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={clickOnEnterOrSpace}
                className={`${cls.action} ${activeSubTab === index ? cls.activeAction : ''}`}
                onClick={() => {
                  setActiveSubTab(index);
                  onChange(activeTab, index);
                }}
                // eslint-disable-next-line react/no-array-index-key -- the tabs come from props and the active tab is tracked by position too
                key={index}
              >
                <div className={cls.actionBg} />
                {item.icon}
                <span>{item.title}</span>
              </div>
            ))}
            <div className={cls.spacer} />
          </div>
        )}
      </div>
    </div>
  );
});
