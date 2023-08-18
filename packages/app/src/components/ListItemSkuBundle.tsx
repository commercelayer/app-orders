import {
  Avatar,
  Badge,
  Icon,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Bundle, Sku } from '@commercelayer/sdk'
import { makeSku } from 'src/mocks/resources/skus'

interface Props {
  resource?: Sku | Bundle
  onSelect: (resource: Sku | Bundle) => void
}

export const ListItemSkuBundle = withSkeletonTemplate<Props>(
  ({ resource = makeSku(), onSelect }) => {
    return (
      <ListItem
        tag='a'
        onClick={(e) => {
          e.preventDefault()
          onSelect(resource)
        }}
        icon={
          <Avatar
            alt={resource.name}
            src={resource.image_url as `https://${string}`}
          />
        }
      >
        <div>
          <Text tag='div' variant='info' weight='semibold'>
            {resource.code}
          </Text>
          <Text tag='div' weight='bold'>
            {resource.name}{' '}
            {resource.type === 'bundles' && (
              <Badge label='Bundle' variant='teal' />
            )}
          </Text>
        </div>
        <Icon name='caretRight' />
      </ListItem>
    )
  }
)
