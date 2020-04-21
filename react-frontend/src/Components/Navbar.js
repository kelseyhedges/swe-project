import React, { Component } from 'react';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';

class TopBar extends Component {

    state = {
        activeUser: null
    }

    logout = () => {
        localStorage.removeItem('usertoken')
        window.location.reload(false);
        this.setState({activeUser: null})
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
                    this.setState({activeUser: result}, console.log(this.state))
                }
                else{
                    localStorage.removeItem('usertoken');
                    this.setState({activeUser: null})
                }
                })
        }
    }

    componentDidMount = () => {
        this.getUserInfo()
    }

    render() {
        return (
            <React.Fragment>
                <Navbar bg="dark" variant="dark" sticky="top" >
                    <Navbar.Brand href="/">e-commerce co.</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/login">Login</Nav.Link>
                        <Nav.Link href="/register" >Register</Nav.Link>
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
                    </Form>
                </Navbar>
            </React.Fragment>
        );
    }
}

export default TopBar;