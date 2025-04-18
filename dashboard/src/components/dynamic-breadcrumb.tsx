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

const DynamicBreadcrumb = () => {
  const location = useLocation()
  const pathSegments =
    location.pathname === '/'
      ? ['dashboard']
      : location.pathname.split('/').filter(Boolean)
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
            <React.Fragment key={breadcrumbPath}>
              <BreadcrumbItem key={breadcrumbPath}>
                {isLast ? (
                  <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={breadcrumbPath}>
                    {formatSegment(segment)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { DynamicBreadcrumb }
