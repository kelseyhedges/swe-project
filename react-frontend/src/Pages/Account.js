import React from 'react'
import { Paper, Button, TextField } from '@material-ui/core';
import TopBar from '../Components/Navbar';
import NotifToast from '../Components/Notifs';
import MenuItem from '@material-ui/core/MenuItem';

const stateList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 
    'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT','VA', 'WA', 'WV', 'WI', 'WY']

export default class AccountSettings extends React.Component{

    state = {
        userid: '',
        firstname: '',
        lastname: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        notifVar: 'error',
        notifMsg: '',
        toastOpen: false,
        editMode: false
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
                this.setState(result, () => console.log(this.state))
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
                    this.setState({userid: result.user_id}, () => this.getAddr())
                }
                else{
                    localStorage.removeItem('usertoken');
                    this.setState({firstname: '',
                    lastname: '',
                    street: '',
                    city: '',
                    state: '',
                    zip: '',})
                }
                })
        }
    }

    componentDidMount = () => {
        this.getUserInfo()
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

    updateAddr = (addrContents) => {
        fetch(`http://localhost:3001/update_address`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                userid: this.state.userid,
                firstname: this.state.firstname,
                lastname: this.state.lastname,
                street: addrContents.Address2,
                city: addrContents.City,
                state: addrContents.State,
                zip: addrContents.Zip5
            })
          })
          .then(res => res.json())
          .then(result => {
              if(result.status && result.status == 1)
                this.triggerNotif('success', 'Success!', this.getAddr)
          })
          .catch(err => {
              console.log(err)
              this.triggerNotif('error', 'Something went wrong :c')
            })
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
                this.updateAddr(result)
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
                    <Paper style={{marginTop: '30px', margin: 'auto', width: '70%', textAlign: 'center',
                    minWidth: '350px', justifyContent: 'center', display: 'grid'}}>
                        <h1>Account Settings</h1>
                        <form style={{display: 'inline-block', width: '80vh', margin: 'auto'}}>
                            <div style={{width: '80vh', display: 'inline'}}>
                            <TextField
                            helperText='First Name'
                            value={this.state.firstname}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('firstname')}
                            InputProps={{
                                readOnly: !this.state.editMode,
                              }}/>
                            <TextField
                            helperText='Last Name'
                            value={this.state.lastname}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('lastname')}
                            InputProps={{
                                readOnly: !this.state.editMode,
                              }}/>
                            </div>
                            <br/>
                            <div style={{width: '80vh', display: 'inline-block'}}>
                            <TextField
                            helperText='Street Address'
                            value={this.state.street}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('street')}
                            InputProps={{
                                readOnly: !this.state.editMode,
                              }}/>
                            <TextField
                            helperText='City'
                            value={this.state.city}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('city')}
                            InputProps={{
                                readOnly: !this.state.editMode,
                              }}/>
                            <TextField
                            helperText='State'
                            select
                            value={this.state.state}
                            style={{margin: 'auto', padding: '10px'}}
                            onChange={this.handleChange('state')}
                            InputProps={{
                                readOnly: !this.state.editMode,
                              }}>
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
                            onChange={this.handleChange('zip')}
                            InputProps={{
                                readOnly: !this.state.editMode,
                              }}/>
                            </div>
                        </form>
                        <Button 
                        onClick={this.state.editMode ? this.onSubmit : () => this.setState({editMode: true})}
                        style={{margin: 'auto', marginBottom: '15px', marginTop: '15px'}}
                        variant='contained'>{this.state.editMode ? 'Done' : 'Edit'}</Button>
                        {this.notifToast()}
                    </Paper>
                </div>
            </div>
        )
    }
}