import React from 'react'
import { Paper, Button, TextField } from '@material-ui/core';
import TopBar from '../Components/Navbar';
import NotifToast from '../Components/Notifs';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList } from 'react-window';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import IconButton from '@material-ui/core/IconButton';

const stateList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 
    'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT','VA', 'WA', 'WV', 'WI', 'WY']

export default class CheckOut extends React.Component{

    state = {
        userid: '',
        toName: '',
        firstname: '',
        lastname: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        cart: {},
        notifVar: 'error',
        notifMsg: '',
        toastOpen: false,
    }

    getAddr = () => {
        fetch(`http://localhost:3001/user_address`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({
                    userid: this.state.userid
                })
              })
              .then(res => res.json())
              .then(result => {
                Object.keys(result).forEach(k => (!result[k] && result[k] !== undefined) && delete result[k]);
                this.setState(result)
              })
    }

    getUserInfo = () => {
        let t = localStorage.getItem('usertoken')
        if(t){
            fetch(`http://localhost:3001/extract_user_info`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({
                    token: t
                })
              })
              .then(res => res.json())
              .then(result => {
                  console.log(result)
                  if(!result.error){
                    this.setState({
                        userid: result.user_id, 
                        toName: result.firstname + ' ' + result.lastname,
                    }, () => this.getAddr())
                }
                else{
                    localStorage.removeItem('usertoken');
                }
                })
        }
    }

    componentDidMount = () => {
        this.getUserInfo();
        this.loadCart();
    }

    triggerNotif = (variant, message, callback = () => {}) => {
        this.setState({
            toastOpen: true,
            notifVar: variant,
            notifMsg: message
        }, () => callback())
    }

    notifToast = () => {
        return(
            <NotifToast
            open={this.state.toastOpen}
            onClose={this.handleClose('toastOpen')}
            variant={this.state.notifVar}
            message={this.state.notifMsg}/>
        )
    }



    onSubmit = () => {
        fetch(`http://localhost:3001/verify_address`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                name: this.state.firstname + ' ' + this.state.lastname,
                street: this.state.street,
                city: this.state.city,
                state: this.state.state,
                zip: this.state.zip
            })
          })
          .then(res => res.json())
          .then(result => {
              console.log(result)
              if(result['Error'])
                  this.triggerNotif('error', result['Error']);
              else
                this.submitOrder(result)
          })
          .catch(err => console.log(err))
    }

    submitOrder = (address) => {

    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value });
    };

    handleClose = name => () => {
        this.setState({[name]: false})
    }

    notifToast = () => {
        return(
            <NotifToast
            open={this.state.toastOpen}
            onClose={this.handleClose('toastOpen')}
            variant={this.state.notifVar}
            message={this.state.notifMsg}/>
        )
    }

    loadCart = () => {
        var c = JSON.parse(localStorage.getItem('eCart'))
        if(c && Object.keys(c).length > 0){
            this.setState({cart: c})
        }
        console.log(c)
    }

    renderRow = ({index, style}) => {
        var key = Object.keys(this.state.cart)[index]
        var item = this.state.cart[key]
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
                <ListItemText secondary={`X ${item.quantity}`}/>
                <ListItemText secondary={`$${item.price.toFixed(2)}`}/>
                <IconButton edge="end" aria-label="add-to-cart" onClick={() => this.addToCart(item, 1)}>
                    <AddShoppingCartIcon/>
                </IconButton>
            </ListItem>
        )
    }

    renderDisabled = ({index, style}) => {
        return(
        <ListItem disabled>
            <ListItemText 
                primary={'Your cart is empty. Please add some items to continue!'}
                style={{textAlign: 'center'}}/>
        </ListItem>
        )
    }

    calcTotal = () => {
        function cost(item){
            return item.quantity * item.price;
        }
        function sum(prev, next){
            return prev + next;
        }
        return Object.values(this.state.cart).map(cost).reduce(sum)
    }

    render(){
        return(
            <div style={{background: '#bdbdbd', overflow: 'hidden', height: '100vh', width: '100vw'}}>
                <TopBar history={this.props.history}/>
                <div style={{marginTop: '30px', textAlign: 'center', justifyContent: 'center'}}>
                    <h1 style={{color: '#424242'}}>Check Out</h1>
                    <Paper style={{
                        marginTop: '30px', margin: 'auto', width: '70%', textAlign: 'center',
                        minWidth: '350px', justifyContent: 'center', display: 'grid'}}>
                        <h4 style={{marginTop: '10px'}}>Cart Contents</h4>
                        {Object.keys(this.state.cart).length > 0 ? 
                            <React.Fragment>
                                <FixedSizeList style={{margin: 'auto'}} height={200} width={700} itemSize={70} 
                                    itemCount={Object.keys(this.state.cart).length}>
                                    {this.renderRow}
                                </FixedSizeList>
                                <ListItem dense divder style={{background: '#fafafa', margin: 'auto', 
                                    textAlign: 'right', marginTop: '0px', width: '700px'}}>
                                    <ListItemText primary={' '}/>
                                    <ListItemText primary={' '}/>
                                    <ListItemText secondary={'Subtotal: '}/>
                                    <ListItemText primary={`$${this.calcTotal().toFixed(2)}`}/>
                                </ListItem>
                                <ListItem dense style={{background: '#fafafa', borderRadius: '7px', width: '700px', 
                                    textAlign: 'right', margin: 'auto', marginBottom: '15px' }}>
                                    <ListItemText primary={' '}/>
                                    <ListItemText primary={' '}/>
                                    <ListItemText secondary={'Total: '}/>
                                    <ListItemText primary={`$${(this.calcTotal() * 1.0825).toFixed(2)}`}/>
                                </ListItem>
                            </React.Fragment>
                            :
                            <FixedSizeList style={{marginTop: '40px', margin: 'auto'}} height={100} 
                                width={600} itemSize={100} 
                                itemCount={1}>
                                {this.renderDisabled}
                            </FixedSizeList>
                        }
                        <h4>Shipping Information</h4>
                        <form style={{display: 'inline-block', width: '80%', margin: 'auto'}}>
                            <div style={{width: '80vh', display: 'inline'}}>
                            <TextField
                            helperText='Ship To (Name)'
                            value={this.state.toName}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('toName')}/>
                            <TextField
                            helperText='Street Address'
                            value={this.state.street}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('street')}/>
                            <TextField
                            helperText='City'
                            value={this.state.city}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('city')}/>
                            <TextField
                            helperText='State'
                            select
                            value={this.state.state}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('state')}>
                                {stateList.map((statename) => (
                                    <MenuItem key={statename} value={statename}>
                                        {statename}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                            helperText='Zip Code'
                            value={this.state.zip}
                            type='number'
                            style={{margin: 'auto', padding: '10px', width: '150px'}}
                            onChange={this.handleChange('zip')}/>
                            </div>
                            <br/>
                            <Button variant='contained'
                                style={{width: '150px', marginBottom: '20px'}}
                                color='primary'
                                >   
                                Submit Order
                            </Button>
                        </form>
                        {this.notifToast()}
                    </Paper>
                </div>
            </div>
        )
    }
}