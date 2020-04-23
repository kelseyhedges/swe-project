import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CartContents from '../Components/CartContents';

const styles = theme => ({
    listItem: {
      padding: `${theme.spacing(1)}px 0`,
    },
    total: {
      fontWeight: '700',
    },
    title: {
      marginTop: theme.spacing(2),
    },
  });

function Confirmation(props){
    const { classes } = props;

    const cart = props.order.items.reduce((obj, item) => {
        obj[item.item_id] = item;
        //delete obj[item.item_id];
        return obj;
    }, {})

    const shipping = [ 
        props.order.addr1, 
        props.order.addr2, 
        `${props.order.city}, ${props.order.state}, ${props.order.zip}`]

    return(
        <React.Fragment>
        <CartContents 
            readOnly
            cart={cart}
            calcTotal={props.calcTotal}
            calcNum={props.calcNum}
        />
        <Grid container >
            <Grid item xs={12} sm={6} style={{margin: 'auto'}}>
            <Typography variant="h6" gutterBottom className={classes.title}>
                Shipping To
            </Typography>
            {shipping.map(item => (
                <Typography key={item} gutterBottom>{item}</Typography>
                ))}
            </Grid>
        </Grid>
        </React.Fragment>
    )
}

export default withStyles(styles)(Confirmation);