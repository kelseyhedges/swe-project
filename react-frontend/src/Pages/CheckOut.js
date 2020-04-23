import React from 'react'
import { Paper, Button } from '@material-ui/core';
import TopBar from '../Components/Navbar';
import CartContents from '../Components/CartContents';
import ShippingInfo from '../Components/ShippingInfo';
import PaymentInfo from '../Components/PaymentInfo';
import ReviewOrder from '../Components/ReviewOrder';
import NotifToast from '../Components/Notifs';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
    layout: {
        minWidth: '800px',
        marginLeft: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
            width: 750,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 3,
        padding: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
        marginTop: theme.spacing.unit * 6,
        marginBottom: theme.spacing.unit * 6,
        padding: theme.spacing.unit * 3,
        },
    },
    grow: {
        flexGrow: 1,
    },
    stepper: {
        padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 5}px`
    },
    
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    button: {
        marginTop: theme.spacing.unit * 3,
        marginLeft: theme.spacing.unit,
    },
});

const steps = ['Cart Contents', 'Shipping Information', 'Payment Information', 'Review Your Order']

class CheckOut extends React.Component{

    state = {
        activeStep: 0,
        userid: '',
        toName: '',
        firstname: '',
        lastname: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        cart: {},
        nameOnCard: "",
        cardNumber: "",
        cardExpiration: "",
        cardCVV: "",
        notifVar: 'error',
        notifMsg: '',
        toastOpen: false,
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
                this.setState(result)
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
                    this.setState({
                        userid: result.user_id, 
                        toName: result.firstname + ' ' + result.lastname,
                    }, () => this.getAddr())
                }
                else{
                    localStorage.removeItem('usertoken');
                }
                })
        }
    }

    componentDidMount = () => {
        this.getUserInfo();
        this.loadCart();
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

    handleNext = () => {
        this.setState(state => ({
            activeStep: state.activeStep + 1,
        }));
    };
    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1,
        }));
    };

    validateInput(step){
        if(step === 0){
            return(this.state.email.length > 1 && this.state.numTickets > 0 && this.state.entryDate !== null && this.state.cancelled !== true);
        }
        else if(step === 1){
            return(this.state.nameOnCard.length > 1 && this.state.cardCVV.length > 1 && this.state.cardExpiration.length > 1 && this.state.cardNumber.length > 1);
        }
        else{
            return false;
        }
    }

    getStepContent(step) {
        switch (step) {
            case 0:
                return (
                <React.Fragment>
                    <h4>Cart Contents</h4>
                    <CartContents cart={this.state.cart}
                    calcTotal={this.calcTotal}
                    calcNum={this.calcNum}
                    adjustNum={this.adjustNum}
                    />
                </React.Fragment>);
            case 1:
                return (
                <React.Fragment>
                    <h4>Shipping Information</h4>
                    <ShippingInfo state={this.state} 
                    handleChange={this.handleChange}/>
                </React.Fragment>
                )
            case 2:
                return(
                <React.Fragment>
                    <h4>Payment Information</h4>
                    <PaymentInfo val={this.state} 
                    handleChange={this.handleChange}/>
                </React.Fragment>)
            case 3:
                return (
                <React.Fragment>
                    <h4>Review Order</h4>
                    <ReviewOrder val={this.state}
                    calcTotal={this.calcTotal}
                    calcNum={this.calcNum}/>
                </React.Fragment>)
            default:
                throw new Error('Unknown step');
        }
    }

    onSubmit = () => {
        fetch(`http://localhost:3001/verify_address`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                name: this.state.toName,
                street: this.state.street,
                city: this.state.city,
                state: this.state.state,
                zip: this.state.zip
            })
          })
          .then(res => res.json())
          .then(result => {
              if(result['Error'])
                this.triggerNotif('error', result['Error']);
              else
                this.submitOrder(result)
          })
          .catch(err => console.log(err))
    }

    submitOrder = (addrContents) => {
        fetch(`http://localhost:3001/new_order`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                addr1: addrContents.Address1,
                addr2: addrContents.Address2,
                city: addrContents.City,
                state: addrContents.State,
                zip: addrContents.Zip5,
                user_id: this.state.userid,
                cart: this.state.cart
            })
          })
          .then(res => res.json())
          .then(result => console.log(result))
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

    loadCart = () => {
        var c = JSON.parse(localStorage.getItem('eCart'))
        if(c){
            this.setState({cart: c})
        }
    }

    adjustNum = (key, val) => {
        var c = JSON.parse(localStorage.getItem('eCart'));
        if(c[key]){
            c[key].quantity += val
            if (c[key].quantity == 0)
                delete c[key]
        }
        else{
            console.log('Item quantity error')
        }
        localStorage.setItem('eCart', JSON.stringify(c))
        this.loadCart()
    }

    calcTotal = () => {
        function cost(item){
            return item.quantity * item.price;
        }
        function sum(prev, next){
            return prev + next;
        }
        return Object.values(this.state.cart).map(cost).reduce(sum)
    }

    calcNum = () => {
        function num(item){
            return item.quantity;
        }
        function sum(prev, next){
            return prev + next;
        }
        if(Object.values(this.state.cart).length > 0)
            return Object.values(this.state.cart).map(num).reduce(sum);
        else
            return 0;
    }

    render(){
        const { classes } = this.props;
        const { activeStep } = this.state;

        return(
            <div style={{background: '#bdbdbd', overflow: 'hidden', height: '100vh', width: '100vw'}}>
                <TopBar homePage numInCart={this.calcNum()} history={this.props.history}/>
                <div style={{marginTop: '30px', textAlign: 'center', justifyContent: 'center'}}>
                    <h1 style={{color: '#424242'}}>Check Out</h1>
                    <main className={classes.layout}>
                    <Paper className={classes.paper} style={{
                        marginTop: '30px', margin: 'auto', textAlign: 'center',
                        minWidth: '750px', justifyContent: 'center', display: 'grid'}}>
                        <Stepper activeStep={activeStep} className={classes.stepper}>
                        {steps.map(label => (
                            <Step key={label}>
                            <StepLabel >{label}</StepLabel>
                            </Step>
                        ))}
                        </Stepper>
                        <React.Fragment>
                            {activeStep === steps.length ? (
                                <React.Fragment>
                                    <h4>Order Summary</h4>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    {this.getStepContent(activeStep)}
                                    <div className={classes.buttons}>
                                        {activeStep !== 0 && (
                                        <Button onClick={this.handleBack} className={classes.button}>
                                            Back
                                        </Button>
                                        )}
                                        {activeStep === steps.length - 1 ? (<Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.addTickets}
                                        className={classes.button}
                                        >Place Order</Button>) : (<Button
                                        variant="contained"
                                        color="primary"
                                        //disabled={!this.validateInput(activeStep)}
                                        onClick={this.handleNext}
                                        className={classes.button}
                                        >Next</Button>)}
                                    </div>
                                </React.Fragment>
                            )}
                        </React.Fragment>                        
                        {this.notifToast()}
                    </Paper>
                    </main>
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(CheckOut);