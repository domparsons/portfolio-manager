import { useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import * as React from 'react'
import App from '@/App'

const DynamicBreadcrumb = () => {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1
          const breadcrumbPath = `/${pathSegments.slice(0, index + 1).join('/')}`

          return (
            <BreadcrumbItem key={breadcrumbPath}>
              {isLast ? (
                <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumbPath}>
                  {formatSegment(segment)}
                </BreadcrumbLink>
              )}
              {!isLast && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { DynamicBreadcrumb }
