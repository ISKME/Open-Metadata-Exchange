/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { classNames } from 'shared/lib/classNames/classNames';
import { useState, useRef, useEffect, memo } from 'react';
import { Button } from '../../../shared/ui/Button/Button';
import { CollectionItemCard } from '../../../entities/CollectionItemCard';
import cls from './CollectionList.module.scss';

interface CollectionListProps {
    className?: string;
    collections?: any;
}

export const CollectionList = memo(({ collections, className }: CollectionListProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const carouselRef = useRef(null);
  const [carouselTranslate, setCarouselTranslate] = useState(null);

  const numPages = Math.ceil(collections.length / 4);

  useEffect(() => {
    const initialTranslateVal = carouselRef.current.offsetWidth / 4;
    const diffAmount = initialTranslateVal * 4;
    const translate = currentSlideIndex === 0 ? 0 : initialTranslateVal - (currentSlideIndex * diffAmount);
    setCarouselTranslate(translate);
  }, [currentSlideIndex]);

  function prevSlide() {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }
  function nextSlide() {
    if (currentSlideIndex === numPages) {
      setCurrentSlideIndex(0);
    } else {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }

  return (
    <div className={classNames('', {}, [className])}>
      <div className={cls.collection_list_wrapper}>
        <ul className={cls.collection_list} ref={carouselRef} style={{ transform: `translateX(${carouselTranslate}px)` }}>
          {collections && collections.map((el: { name: any; }) => (
            <CollectionItemCard collection={el} key={el.name} />
          ))}
        </ul>
        <div className={cls.scroll_buttons}>
          <Button disabled={currentSlideIndex === 0} onClick={prevSlide} title="Previous" />
          <Button disabled={currentSlideIndex === numPages} onClick={nextSlide} title="Next" />
        </div>
      </div>
    </div>
  );
});
