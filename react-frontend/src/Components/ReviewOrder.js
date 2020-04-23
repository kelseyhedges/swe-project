import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CartContents from '../Components/CartContents';

const styles = theme => ({
    listItem: {
      padding: `${theme.spacing.unit}px 0`,
    },
    total: {
      fontWeight: '700',
    },
    title: {
      marginTop: theme.spacing.unit * 2,
    },
  });

function ReviewOrder(props){
    const { classes } = props;
    const payments = [
        { name: 'Card type', detail: 'Visa' },
        { name: 'Card holder', detail: props.val.nameOnCard },
        { name: 'Card number', detail: 'xxxx-xxxx-xxxx-' + props.val.cardNumber.substring(props.val.cardNumber.length-4, props.val.cardNumber.length) },
        { name: 'Expiry date', detail: props.val.cardExpiration },
      ];

    const shipping = [ 
        props.val.toName, 
        props.val.street, 
        `${props.val.city}, ${props.val.state}`, 
        props.val.zip]

    return(
        <React.Fragment>
        <CartContents 
            readOnly
            cart={props.val.cart}
            calcTotal={props.calcTotal}
            calcNum={props.calcNum}
        />
        <Grid container spacing={16}>
            <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom className={classes.title}>
                Shipping To
            </Typography>
            {shipping.map(item => (
                <Typography gutterBottom>{item}</Typography>
                ))}
            </Grid>
            <Grid item container direction="column" xs={12} sm={6}>
            <Typography variant="h6" gutterBottom className={classes.title}>
                Payment Details
            </Typography>
            <Grid container>
                {payments.map(payment => (
                <React.Fragment key={payment.name}>
                    <Grid item xs={6}>
                    <Typography gutterBottom>{payment.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography gutterBottom>{payment.detail}</Typography>
                    </Grid>
                </React.Fragment>
                ))}
            </Grid>
            </Grid>
        </Grid>
        </React.Fragment>
    )
}

export default withStyles(styles)(ReviewOrder);