import React from 'react'
import { Paper, Button, TextField } from '@material-ui/core';
import TopBar from '../Components/Navbar';
import { withStyles } from '@material-ui/styles';
import NotifToast from '../Components/Notifs';

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

class Login extends React.Component{
    state = {
        userid: '',
        passcode: '',
        notifVar: 'error',
        notifMsg: '',
        toastOpen: false
    }

    triggerNotif = (variant, message) => {
        this.setState({
            toastOpen: true,
            notifVar: variant,
            notifMsg: message
        })
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
        fetch(`http://localhost:3001/login`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                userid: this.state.userid,
                passcode: this.state.passcode
            })
          })
          .then(res => res.json())
          .then(result => {
              console.log(result);
              if (result.error){
                  this.triggerNotif('error', result.error);
              }
              else{
                  localStorage.setItem('usertoken', result.token);
                  this.props.history.push("/register");
              }
          })
          .catch(err => console.log(err))
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

    render(){
        return(
            <div style={{overflow: 'hidden', height: '100vh', width: '100vw'}}>
                <TopBar/>
                <div style={{marginTop: '50px', justifyContent: 'center'}}>
                    <Paper style={{marginTop: '30px', margin: 'auto', width: '25%', textAlign: 'center',
                    minWidth: '350px', height: '300px', justifyContent: 'center', display: 'grid'}}>
                        <h1>Login</h1>
                        <form className={this.props.classes.root}>
                            <TextField
                            id='username'
                            helperText='Email'
                            value={this.state.userid}
                            inputProps={{
                                name: 'userid',
                                id: 'uid',
                            }}
                            className={this.props.classes.formItem}
                            onChange={this.handleChange('userid')}/>
                            <TextField
                            id='pass-code'
                            helperText='Password'
                            type='password'
                            autoComplete='current-password'
                            value={this.state.passcode}
                            inputProps={{
                                name: 'passcode',
                                id: 'pass',
                            }}
                            className={this.props.classes.formItem}
                            onChange={this.handleChange('passcode')}/>
                        </form>
                        <Button 
                        onClick={this.onSubmit}
                        style={{margin: 'auto', marginBottom: '15px', marginTop: '15px'}}
                        variant='contained'>
                            Submit</Button>
                        {this.notifToast()}
                    </Paper>
                </div>
            </div>
        )
    }
}
export default withStyles(styles)(Login);