import React from "react";
import firebase from "../../firebase"; 
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message, 
  Image
} from "semantic-ui-react";
import { Link } from "react-router-dom";

import LOGO from '../../logo.png'

class ForgotPass extends React.Component {
  state = {
    email: "", 
    errors: [],
    message:"",
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
        .sendPasswordResetEmail(this.state.email).then(()=>{ 
            this.setState({
                message: "Email with Password Reset Link is sent to your Inbox",
                loading: false
              });
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

  isFormValid = ({ email }) => email ;

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  render() {
    const { email, errors, loading,message } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Image src={LOGO} spaced="right"   className="logo" />
          <Header as="h1" icon color="violet" textAlign="center"> 
            Forgot Password
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
          {message.length > 0 && (
            <Message success>
              <h3>Email Sent</h3>
              { message}
            </Message>
          )}
          <Message>
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default ForgotPass;