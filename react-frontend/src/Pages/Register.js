import React from 'react'
import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import TopBar from '../Components/Navbar';
import RegisterForm from '../Components/RegistrationForm'
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

class RegisterStyled extends React.Component{

    state = {
        notifVar: 'success',
        notifMsg: '',
        toastOpen: false
    }

    onSubmit = () => {
        this.triggerNotif('success', 'Registration successful')
        this.props.history.push('/login')
    }

    triggerNotif = (variant, msg) => {
        this.setState({
            toastOpen: true,
            notifVar: variant,
            notifMsg: msg
        })
    }

    handleClose = name => () => {this.setState({[name]: false})}

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
            <div style={{background: '#bdbdbd', overflow: 'hidden', height: '100vh', width: '100vw'}}>
            <TopBar history={this.props.history}/>
            <div style={{textAlign: 'center', marginTop: '30px', justifyContent: 'center'}}>
                <h1 style={{color: '#424242'}}>Register</h1>
                <Paper style={{marginTop: '30px', margin: 'auto', width: '25%', textAlign: 'center',
                 minWidth: '350px', justifyContent: 'center', display: 'grid'}}>
                    <RegisterForm onSubmit={this.onSubmit}/>
                </Paper>
            </div>
            {this.notifToast()}
            </div>
        )
    }
}
export default withStyles(styles)(RegisterStyled);