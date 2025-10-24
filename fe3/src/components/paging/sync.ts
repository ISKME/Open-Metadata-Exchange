// @ts-nocheck
/* eslint-disable */
import { useState, useEffect } from 'react';

export const SyncPaging = (props) => {
  const {
    items,
    children,
    pageSize,
  } = props

  const [itemsToDisplay, setItemsToDisplay] = useState([])
  const [nextPage, setNextPage] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(0)

  const updateDisplayItems = (pageNumber: number) => {
    setNextPage(pageNumber)
    setCurrentPage(pageNumber)
    setItemsToDisplay(items[pageNumber])
  }

  useEffect(() => {
    if (!items) return
    updateDisplayItems(nextPage)
  }, [items])

  const pages = Object.keys(items || {}).map((item) => Number(item))

  return (
    children(itemsToDisplay || [], {
      currentPage,
      pageCount: pages.length,
      pages,
    }, {
      first: async () => updateDisplayItems(0),
      last: async () => updateDisplayItems(pages.length >= 0 ? pages.length - 1 : 0),
      goto: async (pageNumber: number) => (pageNumber >= 0 && pageNumber < pages.length) && updateDisplayItems(pageNumber),
      back: async () => (currentPage >= 1) && updateDisplayItems(currentPage - 1),
      next: async () => (currentPage < pages.length - 1) && updateDisplayItems(currentPage + 1),
    })
  )
}
