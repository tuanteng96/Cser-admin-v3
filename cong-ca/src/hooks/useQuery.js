import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import qs from 'query-string'

export default function useQuery() {
  const locaiton = useLocation()
  const queryString = useMemo(
    () => qs.parse(locaiton.search),
    [locaiton.search]
  )
  return queryString
}
