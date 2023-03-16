import {
  Avatar,
  ListItem,
  Text,
  withinSkeleton
} from '@commercelayer/app-elements'
import type { LineItem } from '@commercelayer/sdk'

interface Props {
  lineItem: LineItem
}

export const OrderLineItem = withinSkeleton<Props>(
  ({ lineItem }): JSX.Element => {
    if (lineItem.item_type !== 'skus') {
      return <></>
    }

    return (
      <ListItem
        borderStyle='dashed'
        gutter='none'
        icon={
          <Avatar alt={lineItem.name ?? ''} src={lineItem.image_url ?? ''} />
        }
      >
        <div>
          <Text size='small' tag='div' variant='info' weight='medium'>
            SKU {lineItem.sku_code}
          </Text>
          <Text tag='div' weight='bold'>
            {lineItem.name}
          </Text>
        </div>
        <Text tag='div' variant='info' weight='medium' wrap='nowrap'>
          {lineItem.formatted_unit_amount} x {lineItem.quantity}
        </Text>
        <Text tag='div' weight='bold'>
          {lineItem.formatted_total_amount}
        </Text>
      </ListItem>
    )
  }
)
