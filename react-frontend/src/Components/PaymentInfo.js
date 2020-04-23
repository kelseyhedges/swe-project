import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

function PaymentInfo(props) {
  return (
    <React.Fragment>
      <Grid style={{margin: 'auto', alignItems: 'center'}} container direction='column'>
        <Grid item xs={12} md={6} style={{width: '600px'}}>
          <TextField required id="cardName" label="Name on card" value={props.val.nameOnCard} onChange={props.handleChange('nameOnCard')} fullWidth />
        </Grid>
        <Grid item xs={12} md={6} style={{width: '600px'}}>
          <TextField required id="cardNumber" label="Card number" type="number" value={props.val.cardNumber} onChange={props.handleChange('cardNumber')} fullWidth />
        </Grid>
        <Grid item xs={12} md={6} style={{width: '600px'}}>
          <TextField required id="expDate" label="Expiry date (MM/YY)" value={props.val.cardExpiration} onChange={props.handleChange('cardExpiration')} fullWidth />
        </Grid>
        <Grid item xs={12} md={6} style={{width: '600px'}}>
          <TextField
            required
            id="cvv"
            label="CVV"
            type="number"
            value={props.val.cardCVV}
            onChange={props.handleChange('cardCVV')}
            style={{marginBottom: '30px'}}
            fullWidth
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default PaymentInfo;