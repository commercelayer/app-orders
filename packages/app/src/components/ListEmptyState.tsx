import { A, EmptyState } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered' | 'presetView'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  if (scope === 'presetView') {
    return (
      <EmptyState
        title='All good here'
        description={
          <div>
            <p>There are no orders for the current list.</p>
          </div>
        }
      />
    )
  }

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No orders found!'
        description={
          <div>
            <p>
              We didn't find any orders matching the current filters selection.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No orders yet!'
      description={
        <div>
          <p>Add an order with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/orders'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
