/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { classNames } from 'shared/lib/classNames/classNames';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { fetchCollections, fetchLibrary } from 'widgets/CollectionList/model/services/ActionCreators';
// import { fetchCollectionsByMicrosite } from 'widgets/MicrositeCollectionList/model/services/ActionCreators';
// import { SearchBar } from '../../../features/SearchBar';
import { AppLink } from 'shared/ui/AppLink/AppLink';
import { Paging } from 'components/paging';
import { CollectionList } from '../../../widgets/CollectionList';
import { MicrositeCollectionList } from '../../../widgets/MicrositeCollectionList';
import cls from './Explore.module.scss';
import { SearchBar } from 'features/SearchBar';
import { Button } from 'shared/ui/Button/Button';
import { Breadcrumb } from 'components/breadcrumb';

interface ExploreProps {
  className?: string;
}
export function Explore({ className }: ExploreProps) {
  // const [data, setData] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  // const [filteredData, setFilteredData] = useState<any[]>(data);
  // const [microsites, setMicrosites] = useState<any[]>([]);
  // const [inputValue, setInputValue] = useState<string>('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    library,
    // collections,
    // isLoading,
    // error,
  } = useAppSelector((state) => state.collectionReducer);
  // const {
  //   collectionsByMicrosite,
  // } = useAppSelector((state) => state.collectionsByMicrositeReducer);

  // eslint-disable-next-line spaced-comment

  useEffect(() => {
    dispatch(fetchLibrary());
    // dispatch(fetchCollections());
    // dispatch(fetchCollectionsByMicrosite());
  }, [dispatch]);

  useEffect(() => {
    setSections(library.sections);
    // setData(collections);
    // setFilteredData(collections);
    // setMicrosites(collectionsByMicrosite);
  }, [library]); // , collections, collectionsByMicrosite

  // function handleInputChange(event: any) {
  //   const cleanedUpQuery = event.target.value.trim().toLowerCase();
  //   console.log(cleanedUpQuery);
  //   if (cleanedUpQuery === '') {
  //     setFilteredData(data);
  //   } else {
  //     const updatedList = [...data].filter((x) => x.name.toLowerCase().includes(cleanedUpQuery));
  //     setFilteredData(updatedList);
  //   }
  //   setInputValue(event.target.value);
  // }

  // const times = (input: number) => {
  //   const ret = [];
  //   for (let i = 0; i < input; i += 1) {
  //     ret.push(i);
  //   }
  //   return ret;
  // };
  // const items = times(150);
  // const fetchPage = (pageNumber: number, pageSize: number) => new Promise((resolve) => {
  //   setTimeout(() => {
  //     const res = items.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize);
  //     resolve([res]);
  //   }, 1000);
  // });
  const [inputValue, setInputValue] = useState<string>('');

  function onPress({ key }) {
    if (key === 'Enter') {
      navigate(`/imls/search/?f.search=${inputValue}`);
    }
  }

  return (
    <div className={classNames(cls.Explore, {}, [className])}>
      {/* <h1 className={cls.explore_title}>Explore</h1> */}
      <div className={cls['breadcrumb']}>
        <div className={cls['breadcrumbs']}>
          <Breadcrumb first="Explore" />
        </div>
      </div>
      <div className={cls.links_wrapper}>
        {/* <NavLink to="/imls/search" className={cls.search_redirect}> */}
        <div className={cls.search_redirect}>
          <SearchBar value={inputValue} onInputChange={({ target }) => setInputValue(target.value)} onKeyDown={onPress} placeholder="Search Individual Learning Materials" />
          <Button onClick={() => navigate(`/imls/search/?f.search=${inputValue}`)} title="Search" className={cls.search_button} />
        </div>
        <AppLink to="/imls/advanced-resource-search" aria-label="Go to Advanced resource search page" className={cls.back_link} text="Go to Advanced resource search" />
      </div>

      {/* {isLoading && <h3>Loading...</h3>}
      {error && <h3>{error}</h3>} */}

      {sections.map((section, index) => {
        if (section.type === 'Collections') {
          return (
            <div className={cls.shared_collections} key={index}>
              <div className={cls.titles_wrapper}>
                <h2>{section.name}</h2>
                <AppLink to="/imls/browse" aria-label="Go to View All Collections page" className={cls.back_link} text="View All Collections" />
              </div>
              <CollectionList collections={section.data} />
            </div>
          );
        }
        return (
          <div className={cls.collections_by_microsite} key={index}>
            <h2>{section.name}</h2>
            <MicrositeCollectionList microsites={section.data} />
          </div>
        );
      })}

      {/* <Paging fetchPage={fetchPage} itemCount={150} query> */}
      {/*   {(el) => <b>{el}</b>} */}
      {/* </Paging> */}

      {/* <div className={cls.shared_collections}> */}
      {/*   <div className={cls.titles_wrapper}> */}
      {/*     <h2>All Shared Collections</h2> */}
      {/*     <AppLink to="/imls/browse" aria-label="Go to View All Collections page" className={cls.back_link} text='View All Collections' /> */}
      {/*   </div> */}
      {/*   <div> */}
      {/*     <SearchBar value={inputValue} onInputChange={handleInputChange} placeholder="Search Collections" /> */}
      {/*   </div> */}
      {/*   <CollectionList collections={filteredData} /> */}
      {/* </div> */}

      {/* <div className={cls.collections_by_microsite}> */}
      {/*   <h2>By Microsite</h2> */}
      {/*   <p></p> */}
      {/*   <MicrositeCollectionList microsites={microsites} /> */}
      {/* </div> */}

      {/* <div> */}
      {/*   <h2 style={{ marginBottom: '20px' }}>By Education Level</h2> */}
      {/*   <p>TODO:If we want to list collections by Education Level - we need a flag for the Collection indicating the general level of education</p> */}
      {/* </div> */}
    </div>
  );
}
