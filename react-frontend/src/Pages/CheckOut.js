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
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(4))]: {
            width: 750,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(6))]: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
        padding: theme.spacing(3),
        },
    },
    grow: {
        flexGrow: 1,
    },
    stepper: {
        padding: `${theme.spacing(3)}px 0 ${theme.spacing(5)}px`
    },
    
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    button: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(1),
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
        addrValidated: false
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
        this.validateStep(this.state.activeStep, () => this.setState(state => ({
            activeStep: state.activeStep + 1,
        })))
    };
    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1,
        }));
    };

    validExpiry = (exp) => {
        var resp = {'valid' : true};
        var s = exp.split('/')
        var today = new Date();
        if(s.length !== 2 || exp.length !== 5){
            resp.valid = false;
            resp.reason = 'Must be in MM/DD form'
        }
        else if(Number(s[0]) < 1 || Number(s[0] > 12)){
            resp.valid = false;
            resp.reason = 'Invalid month value'
        }
        else if(Number(s[1] < (today.getFullYear() % 100)) || (Number(s[1]) === today.getYear() && Number(s[0]) <= (today.getMonth() + 1))){
            resp.valid = false;
            resp.reason = 'Card Expired :c'
        }
        return resp
    }

    validateStep(step, callback){
        if(step === 1){
            this.verifyAddress(callback)
        }
        else if(step === 2){
            var expiryValid = this.validExpiry(this.state.cardExpiration)
            if(this.state.nameOnCard.length === 0) //&&  && this.state.cardExpiration.length > 5 && )
                this.triggerNotif('error', 'Cardholder name is invalid');
            else if(this.state.cardNumber.length !== 16)
                this.triggerNotif('error', 'Invalid card number');
            else if(this.state.cardCVV.length !== 3)
                this.triggerNotif('error', 'Invalid CVV');
            else if(!expiryValid.valid)
                this.triggerNotif('error', `Invalid expiry: ${expiryValid.reason}`);
            else
                callback()
        }
        else
            callback()
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

    verifyAddress = (callback) => {
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
              else{
                this.setState({
                    toName: result.Address1,
                    street: result.Address2,
                    city: result.City,
                    state: result.State,
                    zip: result.Zip5,
                }, callback())
              }
          })
          .catch(err => {
              console.log(err)
            })
    }

    submitOrder = () => {
        fetch(`http://localhost:3001/new_order`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                addr1: this.state.toName,
                addr2: this.state.street,
                city: this.state.city,
                state: this.state.state,
                zip: this.state.zip,
                user_id: this.state.userid,
                cart: this.state.cart
            })
          })
          .then(res => res.json())
          .then(result => {
              // ********************************************* ORDER PLACED GO TO ORDER CONFIRMATIN PAGE ****************************************************
              console.log(result)
            })
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
            if (c[key].quantity === 0)
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
                                        {activeStep === steps.length - 1 ? (
                                        <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.submitOrder}
                                        className={classes.button}
                                        >Place Order</Button>) : (<Button
                                        variant="contained"
                                        color="primary"
                                        disabled={Object.keys(this.state.cart).length < 1}
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