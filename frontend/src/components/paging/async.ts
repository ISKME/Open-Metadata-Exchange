// @ts-nocheck
/* eslint-disable */
import { useState, useEffect } from 'react';

enum IFetchState {
  RENDERING = 0,
  RENDERED = 1,
  LOADING = 2,
  READY = 3,
  LOADED = 4,
}

export const AsyncPaging = (props) => {
  const {
    items,
    fetchPage,
    children,
    itemCount,
    pageSize,
    setItems,
    skipInitialFetch,
    pkey,
    onPageChanged,
  } = props

  const [paginatedItems, setPaginatedItems] = useState(items || {})
  const [itemsToDisplay, setItemsToDisplay] = useState([])
  const [fetchState, setFetchState] = useState(IFetchState.RENDERING)
  const [nextPage, setNextPage] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [internalItemCount, setInternalItemCount] = useState<number>(itemCount || 0)
  const [pages, setPages] = useState<number[]>([])

  const updateDisplayItems = (pageNumber: number) => {
    const itemsToUse = items || paginatedItems
    setItemsToDisplay(itemsToUse[pageNumber])
    onPageChanged && onPageChanged(pageNumber)
  }

  const handleFetchedPage = (fetchRequest, fetchResult) => {
    const itemsToUse = { ...(items || paginatedItems) }
    itemsToUse[fetchRequest.pageNumber] = fetchResult[0]
    fetchResult[1] && setInternalItemCount(fetchResult[1].itemCount)
    if (setItems) setItems(itemsToUse)
    else setPaginatedItems(itemsToUse)
    setFetchState(IFetchState.LOADED)
  }

  const fetchPageImpl = async (pageNumber: number) => {
    setFetchState(IFetchState.LOADING)
    setNextPage(pageNumber)
    const itemsToUse = items || paginatedItems
    if (itemsToUse[pageNumber]) {
      setFetchState(IFetchState.LOADED)
      return
    }
    const fetchRes = await fetchPage(pageNumber, pageSize)
    handleFetchedPage({ pageNumber, pageSize }, fetchRes)
  }

  const handleLoadPage = () => {
    setFetchState(IFetchState.READY)
    setCurrentPage(nextPage)
    updateDisplayItems(nextPage)
  }

  useEffect(() => {
    if (items && setItems) {
      const shouldBeReset = Object.keys(items).length > 0
      if (shouldBeReset) {
        setItems({})
        if (props.__onReset) props.__onReset()
      }
    } else {
      const shouldBeReset = Object.keys(paginatedItems).length > 0
      shouldBeReset && setPaginatedItems({})
    }
    setCurrentPage(0)
  }, [pageSize, pkey])

  useEffect(() => {
    if (internalItemCount && pageSize && pageSize >= 0) {
      const newPageCount = Math.ceil(internalItemCount / pageSize)
      setPages(Array.from(Array(newPageCount).keys()))
    }
  }, [internalItemCount, pageSize])

  useEffect(() => (fetchState === IFetchState.LOADED) && handleLoadPage(), [items, paginatedItems, fetchState])

  useEffect(() => (itemCount && itemCount > 0) && setInternalItemCount(itemCount), [itemCount])

  useEffect(() => {
    if (items) return
    const shouldBeReset = Object.keys(paginatedItems).length === 0
    const initialPage = props.__getInitialPage ? props.__getInitialPage() : 0
    shouldBeReset && !skipInitialFetch && initialPage >= 0 && fetchPageImpl(initialPage)
  }, [paginatedItems])

  useEffect(() => {
    if (!items) return
    const shouldBeReset = Object.keys(items).length === 0
    const initialPage = props.__getInitialPage ? props.__getInitialPage() : 0
    shouldBeReset && !skipInitialFetch && initialPage >= 0 && fetchPageImpl(initialPage)
  }, [items])

  return (
    children(itemsToDisplay || [], {
      currentPage,
      fetchState,
      pageCount: pages.length,
      pages,
    }, {
      first: async () => fetchPageImpl(0),
      last: async () => fetchPageImpl(pages.length >= 0 ? pages.length - 1 : 0),
      goto: async (pageNumber: number) => (pageNumber >= 0 && pageNumber < pages.length) && fetchPageImpl(pageNumber),
      back: async () => (currentPage >= 1) && fetchPageImpl(currentPage - 1),
      next: async () => (currentPage < pages.length - 1) && fetchPageImpl(currentPage + 1),
    })
  )
}
