import React, { Component } from 'react';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { grey } from '@material-ui/core/colors';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const no_user = [
    {link: '/', name: 'Home'},
    {link: '/register', name: 'Register'},
    {link: '/login', name: 'Login'},
]
const user = [
    {link: '/', name: 'Home'},
    {link: '/account_settings', name: 'My Account'},
]

class TopBar extends Component {

    state = {
        activeUser: null,
        links: no_user,
        inCart: {},
        numInCart: 0,
        menuAnchor: null
    }

    openMenu = (event) => {
        this.setState({menuAnchor: event.currentTarget})
    }

    closeMenu = () => {
        this.setState({menuAnchor: null})
    }

    logout = () => {
        localStorage.removeItem('usertoken')
        localStorage.removeItem('eCart')
        window.location.reload(false);
        this.setState({activeUser: null, links: no_user})
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
                    this.setState({activeUser: result, links: user}, console.log(this.state))
                }
                else{
                    localStorage.removeItem('usertoken');
                    this.setState({activeUser: null, links: no_user})
                }
                })
        }
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

    componentDidMount = () => {
        this.getUserInfo()
        this.loadCart()
    }

    render() {
        return (
            <React.Fragment>
                <Navbar bg="dark" variant="dark" sticky="top" >
                    <Navbar.Brand href="/">e-commerce co.</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        {this.state.links.map(item => (
                            <Nav.Link href={item.link}>{item.name}</Nav.Link>
                        ))}
                    </Nav>
                    </Navbar.Collapse>
                    <Form inline>
                        {this.state.activeUser ? 
                        <React.Fragment>
                            <Navbar.Text>
                                Signed in as: {this.state.activeUser.firstname + ' ' + this.state.activeUser.lastname}
                            </Navbar.Text> 
                            <Button style={{marginLeft: '10px'}} onClick={this.logout}
                            variant='outline-danger'size="sm">Logout</Button>
                        </React.Fragment>
                        :
                        <Button variant="outline-success" size="sm" href="/login" >Login</Button>
                        }
                        <IconButton aria-label="cart" onClick={this.openMenu}>
                            <Badge 
                            badgeContent={this.props.homePage ? this.props.numInCart : this.state.numInCart} 
                            color="secondary">
                                <ShoppingCartIcon style={{color: grey[50]}}/>
                            </Badge>
                        </IconButton>
                    </Form>
                </Navbar>
                <Menu anchorEl={this.state.menuAnchor}
                    keepMounted
                    open={Boolean(this.state.menuAnchor)}
                    onClose={this.closeMenu}>
                    <MenuItem onClick={() => this.props.history.push("/checkout")}>Check Out</MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

export default TopBar;