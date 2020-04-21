import React from 'react'
import { Button, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = {
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      width: '90%',
      margin: 'auto'
    },
    formItem: {
      margin: 'auto',
      maxWidth: '90%',
      minWidth: '120px',
      marginTop: '15px'
    },
  };

class RegForm extends React.Component{

    state = {
        passcode: '',
        email: '',
        firstName: '',
        lastName: ''
    }

    onSubmit = () => {
        fetch(`http://localhost:3001/new_user`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                passcode: this.state.passcode,
                email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName
            })
          })
          .then(res => res.json())
          .then(result => {
              if (result.status === 0){
                  console.log('err'); 
              }
              else{
                this.setState({
                    passcode: '',
                    email: '',
                    firstName: '',
                    lastName: ''
                })
                if(this.props.onSubmit){
                    this.props.onSubmit()
                }
              } 
          })
          .catch(err => console.log(err))
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value });
    };

    render(){
        return(
            <div style={{textAlign: 'center'}}>
                <h1 style={{marginTop: '10px'}}>Register</h1>
                <form className={this.props.classes.root}>
                    <TextField
                    id='first-name'
                    helperText='First Name'
                    value={this.state.firstName}
                    className={this.props.classes.formItem}
                    onChange={this.handleChange('firstName')}/>
                    <TextField
                    id='last-name'
                    helperText='Last Name'
                    value={this.state.lastName}
                    className={this.props.classes.formItem}
                    onChange={this.handleChange('lastName')}/>
                    <TextField
                    id='pass-code'
                    helperText='Password'
                    type="password"
                    value={this.state.passcode}
                    className={this.props.classes.formItem}
                    onChange={this.handleChange('passcode')}/>
                    <TextField
                    id='email'
                    helperText='Email Address'
                    value={this.state.email}
                    className={this.props.classes.formItem}
                    onChange={this.handleChange('email')}/>
                </form>
                <Button 
                onClick={this.onSubmit}
                style={{margin: 'auto', marginBottom: '15px', marginTop: '15px'}}
                variant='contained'>
                Submit</Button>
            </div>
        )
    }

}

export default withStyles(styles)(RegForm);