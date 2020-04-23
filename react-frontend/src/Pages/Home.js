import React from 'react'
import { Paper } from '@material-ui/core';
import TopBar from '../Components/Navbar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList } from 'react-window';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import IconButton from '@material-ui/core/IconButton';

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
            c[item.item_id] = {'quantity': 1, 'price': item.price, 'name': item.name}
        localStorage.setItem('eCart', JSON.stringify(c))
        this.loadCart()
    }

    loadCart = () => {
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
            <ListItem divider key={item.item_id}
            style={{...style, background: '#fafafa', borderRadius: '7px'}}>
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
            <div style={{background: '#bdbdbd', overflow: 'hidden', height: '100vh', width: '100vw'}}>
                <TopBar history={this.props.history} homePage numInCart={this.state.numInCart}/>
                <div style={{textAlign: 'center', marginTop: '30px', justifyContent: 'center'}}>
                    <h1 style={{color: '#424242', marginTop: '10px'}}>Catalog</h1>
                    <Paper style={{marginTop: '30px', margin: 'auto', textAlign: 'center',
                    width: '650px', justifyContent: 'center', display: 'grid'}}>
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