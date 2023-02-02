import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout
} from '@commercelayer/core-app-elements'
import type { JSX } from 'preact/jsx-runtime'
import { Link } from 'wouter'

export function ErrorNotFound(): JSX.Element {
  return (
    <PageLayout title='Orders'>
      <EmptyState
        title='Not found'
        description='We could not find the resource you are looking for.'
        action={
          <Link href={appRoutes.home.makePath()}>
            <Button variant='primary'>Go Home</Button>
          </Link>
        }
      />
    </PageLayout>
  )
}
