import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList } from 'react-window';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import { Form } from 'react-bootstrap';
import React from 'react'

export default function CartContents(props){
    function renderRow({index, style}){
        var key = Object.keys(props.cart)[index]
        var item = props.cart[key]
        return(
            <ListItem dense divider key={item.item_id} 
            style={{...style, background: '#fafafa', borderRadius: '7px'}}>
                <ListItemAvatar>
                    <Avatar
                        alt={`Avater num ${item.item_id}`}
                        src={`/productImg${key % 3}.jpg`}
                    />
                </ListItemAvatar>
                <ListItemText primary={item.name}/>
                <ListItemText secondary={`$${item.price.toFixed(2)}`}/>
                { !props.readOnly ?
                <Form inline>
                    <IconButton color='primary' aria-label="add-to-cart" onClick={() => props.adjustNum(key, -1)}>
                        <RemoveIcon/>
                    </IconButton>
                    <ListItemText secondary={`X ${item.quantity}`}/>
                    <IconButton color='primary' aria-label="add-to-cart" onClick={() => props.adjustNum(key, 1)}>
                        <AddIcon/>
                    </IconButton>
                </Form>
                :
                <Form inline>
                <ListItemText primary={' '}/>
                <ListItemText secondary={`X ${item.quantity}`}/>
                </Form>
                }
            </ListItem>
        )
    }
    
    function renderDisabled({index, style}){
        return(
        <ListItem disabled>
            <ListItemText 
                primary={'Your cart is empty. Please add some items to continue!'}
                style={{textAlign: 'center'}}/>
        </ListItem>
        )
    }

    return(
        <React.Fragment>
        {Object.keys(props.cart).length > 0 ? 
            <React.Fragment>
                <FixedSizeList style={{margin: 'auto', background: '#fafafa', borderRadius: '7px'}}
                 height={props.readOnly ? 100 : 200} width={700} itemSize={70} 
                    itemCount={Object.keys(props.cart).length}>
                    {renderRow}
                </FixedSizeList>
                <ListItem dense style={{background: '#fafafa', margin: 'auto', 
                    textAlign: 'right', marginTop: '0px', width: '700px'}}>
                    <ListItemText primary={' '}/>
                    <ListItemText primary={' '}/>
                    <ListItemText secondary={'Subtotal: '}/>
                    <ListItemText primary={`$${props.calcTotal().toFixed(2)}`}/>
                </ListItem>
                <ListItem dense style={{background: '#fafafa', borderRadius: '7px', width: '700px', 
                    textAlign: 'right', margin: 'auto', marginBottom: '15px' }}>
                    <ListItemText primary={' '}/>
                    <ListItemText primary={' '}/>
                    <ListItemText secondary={'Total: '}/>
                    <ListItemText primary={`$${(props.calcTotal() * 1.0825).toFixed(2)}`}/>
                </ListItem>
            </React.Fragment>
            :
            <FixedSizeList style={{marginTop: '40px', margin: 'auto'}} height={100} 
                width={600} itemSize={100} 
                itemCount={1}>
                {renderDisabled}
            </FixedSizeList>
        }
        </React.Fragment>
    )
}