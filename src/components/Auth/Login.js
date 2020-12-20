import React from "react";
import firebase from "../../firebase";
import {isMobile} from "react-device-detect";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
  Image
} from "semantic-ui-react";
import { Link } from "react-router-dom"; 
import LOGO from '../../logo.png'

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false
  };

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedInUser => {
          if(isMobile)
          {
            let token = window.JSInterface.setUser(signedInUser.user.uid)
          
            firebase.database().ref('users').child(signedInUser.user.uid).child("fcmtoken").update({[token]:1})
            firebase.database().ref('users').child(signedInUser.user.uid).child("channnels").once("value",snap=>{
              Object.values(snap.val()).map(item=>{
                  window.JSInterface.addChannel(item.id);
              });
            })
        }
          
      })
        .catch(err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          });
        });
    }
  };

  isFormValid = ({ email, password }) => email && password;

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  render() {
    const { email, password, errors, loading } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Image src={LOGO} spaced="right"   className="logo" />
          <Header as="h1" icon color="violet" textAlign="center"> 
            Login to DuBuddy
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                className={this.handleInputError(errors, "email")}
                type="email"
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                className={this.handleInputError(errors, "password")}
                type="password"
              />

              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="violet"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
           <Link to="/ForgotPass">Forgot Password</Link><br/>
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;