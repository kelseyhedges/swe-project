import React from 'react'
import { TextField } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';

const stateList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 
    'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT','VA', 'WA', 'WV', 'WI', 'WY']


export default function ShippingInfo(props){
    return(
        <form style={{display: 'inline-block', width: '80%', margin: 'auto'}}>
            <div style={{width: '700px', display: 'inline'}}>
            <TextField
            helperText='Ship To (Name)'
            value={props.state.toName}
            style={{margin: 'auto', padding: '10px'}}
            onChange={props.handleChange('toName')}/>
            <TextField
            helperText='Street Address'
            value={props.state.street}
            style={{margin: 'auto', padding: '10px'}}
            onChange={props.handleChange('street')}/>
            <TextField
            helperText='City'
            value={props.state.city}
            style={{margin: 'auto', padding: '10px'}}
            onChange={props.handleChange('city')}/>
            <TextField
            helperText='State'
            select
            value={props.state.state}
            style={{margin: 'auto', padding: '10px'}}
            onChange={props.handleChange('state')}>
                {stateList.map((statename) => (
                    <MenuItem key={statename} value={statename}>
                        {statename}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
            helperText='Zip Code'
            value={props.state.zip}
            type='number'
            style={{margin: 'auto', padding: '10px', width: '150px'}}
            onChange={props.handleChange('zip')}/>
            </div>
        </form>
    )
}