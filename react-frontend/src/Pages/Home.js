import React from 'react'
import { Paper, Button, TextField } from '@material-ui/core';
import TopBar from '../Components/Navbar';
import NotifToast from '../Components/Notifs';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList } from 'react-window';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

class Home extends React.Component{

    state = {
        inCart: {},
        numInCart: 0,
        items: []
    }

    componentDidMount = () => {
        if(!localStorage.getItem('eCart'))
            localStorage.setItem('eCart', JSON.stringify({}));
        this.loadCart()
        this.getItems()
    }

    addToCart = (item, amt) => {
        var c = JSON.parse(localStorage.getItem('eCart'));
        if(c[item.item_id])
            c[item.item_id].quantity += 1
        else
            c[item.item_id] = {'quantity': 1, 'price': item.price}
        localStorage.setItem('eCart', JSON.stringify(c))
        this.loadCart()
        console.log(this.state)
    }

    loadCart = () => {
        //console.log('Load card called')
        function quantity(item){
            return item.quantity;
        }
        function sum(prev, next){
            return prev + next;
        }
        var c = JSON.parse(localStorage.getItem('eCart'))
        if(c && Object.keys(c).length > 0){
            this.setState({inCart: c, numInCart: Object.values(c).map(quantity).reduce(sum)})
        }
    }

    getItems = () => {
        fetch(`http://localhost:3001/get_items`, {
            method: 'GET',
            headers: {'Content-Type' : 'application/json'},
            })
            .then(res => res.json())
            .then(result => this.setState({items: result.items}, () => console.log(this.state)))
    }

    renderRow = ({index, style}) => {
        var item = this.state.items[index]
        return(
            <ListItem divider key={item.item_id} style={style}>
                <ListItemAvatar>
                    <Avatar
                        alt={`Avater num ${item.item_id}`}
                        src={`/productImg${item.item_id % 3}.jpg`}
                    />
                </ListItemAvatar>
                <ListItemText primary={item.name}/>
                <ListItemText secondary={`$${item.price.toFixed(2)}`}/>
                <IconButton edge="end" aria-label="add-to-cart" onClick={() => this.addToCart(item, 1)}>
                    <AddShoppingCartIcon/>
                </IconButton>
            </ListItem>
        )
    }

    render(){
        return(
            <div style={{overflow: 'hidden', height: '100vh', width: '100vw'}}>
                <TopBar homePage numInCart={this.state.numInCart}/>
                <div style={{marginTop: '50px', justifyContent: 'center'}}>
                    <Paper style={{marginTop: '30px', margin: 'auto', textAlign: 'center',
                    width: '650px', justifyContent: 'center', display: 'grid'}}>
                        <h1 style={{marginTop: '10px'}}>Catalog</h1>
                        <FixedSizeList style={{margin: 'auto', marginTop: '50px', marginBottom: '50px'}} height={400} width={600} itemSize={100} itemCount={this.state.items.length}>
                            {this.renderRow}
                        </FixedSizeList>
                    </Paper>
                </div>
            </div>
        )
    }
}
export default Home;