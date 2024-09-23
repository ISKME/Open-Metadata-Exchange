// @ts-ignore
import { useState, useEffect } from 'react';
import { SearchGrid } from 'widgets/SearchGrid/ui/SearchGrid';
import { CollectionItemCard } from 'entities/CollectionItemCard';
import { Portal } from 'features/Portal';
import axios from 'axios';
import cls from './SubscribedContent.module.scss';

interface SubscribedContentProps {
    className?: string;
}

export const SubscribedContent = ({ className }: SubscribedContentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [unsub, setUnsub] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setSelected('');
      setSelectedCollection('');
    }
  }, [isVisible]);

  const CardSubscribe = ({ data, title, slug }) => {
    function unshare(id) {
      setSelected(`${slug}/${id}`);
      setSelectedCollection(title);
      setIsVisible(true);
    }

    return (
      <div>
        <CollectionItemCard collection={data} className={cls.cardWidth} />
        <div className={cls.labelText} onClick={() => unshare(data.id)}>Unsubscribe collection</div>
      </div>
    );
  };

  return (
    <div>
      <Portal visible={isVisible}>
        <div className={cls['snackbar-but-cooler']}>
          <div className={cls['frame']} />
          <div className={cls['text-container']}>
            <svg className={cls['vector']} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM18 13.2H6V10.8H18V13.2Z" fill="#FF507A"/>
            </svg>
            <div className={cls['text']}>
              <div className={cls['text-only']}>
                <div className={cls['head']}>Unsubscribe from this collection</div>
                <p className={cls['subhead']}>
                  By unsubscribing, this collection will no longer appear in your library and will not sync to your microsite. You may subscribe again later.
                </p>
              </div>
              <div className={cls['div']}>
                <button
                  className={cls['button']}
                  onClick={() => {
                    axios.post(`/api/imls/v2/collections/${selected}/unsubscribe`).then(() => {
                      if (selected) {
                        setUnsub('');
                        setUnsub(selectedCollection);
                        setIsVisible(false);
                      } else {
                        window.location.reload();
                      }
                    });
                  }}
                >
                  <div className={cls['label-text']}>Unsubscribe me</div>
                </button>
                <p className={cls['text-wrapper']} onClick={() => setIsVisible(false)}>I've decided to stay subscribed</p>
              </div>
            </div>
            <div className={cls['action']}>
              <div className={cls['button-icon']} onClick={() => setIsVisible(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18.295 7.115C18.6844 6.72564 18.6844 6.09436 18.295 5.705C17.9056 5.31564 17.2744 5.31564 16.885 5.705L12 10.59L7.115 5.705C6.72564 5.31564 6.09436 5.31564 5.705 5.705C5.31564 6.09436 5.31564 6.72564 5.705 7.115L10.59 12L5.705 16.885C5.31564 17.2744 5.31564 17.9056 5.705 18.295C6.09436 18.6844 6.72564 18.6844 7.115 18.295L12 13.41L16.885 18.295C17.2744 18.6844 17.9056 18.6844 18.295 18.295C18.6844 17.9056 18.6844 17.2744 18.295 16.885L13.41 12L18.295 7.115Z" fill="black"/>
              </svg>
              </div>
            </div>
          </div>
        </div>
      </Portal>
      <div className={cls.callout}>
        <div className={cls.frame}>
          <h1>Search subscribed content</h1>
          <p>
            All of the OER Exchange content you subscribed to
            <br />
            is found here in your library and on your microsite.
          </p>
        </div>
      </div>
      <SearchGrid api="collections/subscribed" title="subscribed collections" un={unsub}>
        {(results) => (
          <div className={cls.searchGrid}>
            {results.map((item) => <CardSubscribe key={`sub-item-${item.id}`} data={item} title={item.name} slug={item.micrositeSlug} />)}
          </div>
        )}
      </SearchGrid>
    </div>
  );
};
