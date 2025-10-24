/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect } from 'react'
import axios from 'axios'
import cls from './Collections.module.scss'

export function Collections() {
  const [data, setData] = useState([])

  useEffect(() => {
    axios.get('/api/curatedcollections/v2/curatedcollections').then(({ data }) => {
      setData(data?.collections?.items || [])
    })
  }, [])

  return (
    <>
      <section className={cls.header}>
        <div className={cls.container}>
          <h1 className={cls.title}>Curated Collections</h1>
          <p className={cls.description}>
            Curated Sets of ATLAS Cases and Supporting Resources
          </p>
        </div>
      </section>
      <section className={cls.collections}>
        <h1>Collections</h1>
        <div className={cls.items}>
          {data.map((item) => (
            <a href={'/curated-collections/new/' + item.id} key={item.id}>
              {!item.thumbnail
                ? <div className={cls.image} />
                : <img className={cls.image}
                  src={item.thumbnail}
                  alt={item.name}
                  width="340"
                  height="170"
                />
              }
              <div className={cls.text}>
                <div className={cls.heading}>
                  <h4>{item.name}</h4>
                </div>
                <br />
                <span className={cls.count}>
                  <p>
                    <span>{item.numResources}</span>
                    <span>Resources</span>
                  </p>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}