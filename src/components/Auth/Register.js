import React from "react";
import firebase from "../../firebase";
import md5 from "md5";
import {isMobile} from "react-device-detect";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
  Dropdown,
  Image
} from "semantic-ui-react";
import LOGO from '../../logo.png'
import { Link } from "react-router-dom";

class Register extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
    usersRef: firebase.database().ref("users"),
    colleges:[],
    courses:[],
    college:"",
    course:"",
    phone:"",
    channelsRef: firebase.database().ref("channels")
  };
componentDidMount(){
  this.getColleges();
  this.getCourse();
}
  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation,college,course,phone }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length||
      !college||
      !course||
      !phone
    );
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);


  handleChange = (event,{value,name}) => {
    this.setState({ [name]:value });
  };
  getColleges=()=>{
    fetch('https://dubuddy.in/appapis/fetch_college', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
            colleges: 'all',  
        }, 
        ) 
      })
      .then((response) =>response.json())
      .then(result=>{
        this.setState({colleges:result})
      })
      .catch((error) => {
        console.error(error);
      });
       
  }
  getCourse=()=>{
      fetch('https://dubuddy.in/appapis/fetch_course', {
         method: 'POST',
         headers: {
           Accept: 'application/json',
           'Content-Type':'application/json'
         },
         body: JSON.stringify({
             course: 'all', 
         })
         
       })
       .then((response) => response.json())
       .then(result=>{
           
          this.setState({courses:result})
       })
       .catch((error) => {
         console.error(error);
       });
        
   }
   addUserToMysql=(user_id,name,email,password)=>
   {

      fetch('https://dubuddy.in/appapis/user.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
            adduser: 'true',
            user_id:user_id,
            name:name,
            email:email,
            password:password,
            phone:this.state.phone,
            course:this.state.course,
            college:this.state.college
        })
      })
      .then((response) => response.json())
      .then(result=>{  

        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });

   }
  handleSubmit = event => {

    event.preventDefault(); 
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
           
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`,  
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {           
                this.addUserToMysql(createdUser.user.uid,createdUser.user.displayName,this.state.email,this.state.password);
                let channelDescription = this.state.college+" DUBuddy Channel" 
                this.addChannel(this.state.college,channelDescription,createdUser.user,this.state.course,this.state.college) 
              });
            })
            .catch(err => {
              console.error(err);
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false
              });
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

  addChannel = ( channelName, channelDetails, user,course,college) => {

    fetch('https://dubuddy.in/appapis/add_channel.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
            isCollegeChannelExists: 'true', 
            college:college,
        })
      })
      .then((response) => response.json())
      .then(result=>{   
        if(result.msg=="no")
        {
          const { channelsRef } = this.state;
          const key = channelsRef.push().key; 
          const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
              name: user.displayName,
              avatar: user.photoURL
            },users:{
              gfdjfjgsjfdsfsd:user.uid
            },
            
          };
           
          channelsRef
            .child(key)
            .update(newChannel)
            .then(() => { 
              // channelsRef.child(key).child("users").push(user.uid);  
              firebase.database().ref('users').child(user.uid).child("channnels").push().update({id:key,noti:0}).then(()=>{
                this.addChannelToMysql(channelName,channelDetails,"no code",this.state.college,this.state.course,user.uid,key)
                isMobile?window.JSInterface.addChannel(key):null; 
                this.joinchannel("-MLWFnEsYvgNlc01TlSp",user);
                firebase.database().ref('users').child(user.uid).child("friends").child("WthjqUPUFtZSTwyfIeiRmZH608L2").set({id:"WthjqUPUFtZSTwyfIeiRmZH608L2",status:0});
                firebase.database().ref('users').child("WthjqUPUFtZSTwyfIeiRmZH608L2").child("friends").child(user.uid).set({id:user.uid,status:0});
              }); 
            })
            .catch(err => {
              console.error(err); 
            });
        }
        else if(!result.msg)
        { 
          this.joinchannel(result[0].channel_id,user)
          this.joinchannel("-MLWFnEsYvgNlc01TlSp",user);
          firebase.database().ref('users').child(user.uid).child("friends").child("WthjqUPUFtZSTwyfIeiRmZH608L2").set({id:"WthjqUPUFtZSTwyfIeiRmZH608L2",status:0});
          firebase.database().ref('users').child("WthjqUPUFtZSTwyfIeiRmZH608L2").child("friends").child(user.uid).set({id:user.uid,status:0});
        }
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
   
  };
  addChannelToMysql=(name,des,channel_code,college,course,user_id,channel_id)=>
   { 
      fetch('https://dubuddy.in/appapis/add_channel.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
            addCollegeChannelOfficial: 'true',
            admin:user_id,
            channel_id:channel_id,
            channel_code:channel_code,
            des:des,
            name:name,
            college:college
        })
      })
      .then((response) => response.json())
      .then(result=>{  
        this.addUserToChannelMysql(user_id,channel_id,this.state.college,this.state.course)
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
   }
  addUserToChannelMysql=(user_id,channel_id,college,course)=>
  { 
      fetch('https://dubuddy.in/appapis/add_channel.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':'application/json'
        },  
        body: JSON.stringify({
            addChannelUser: 'true',
            user_id:user_id,
            channel_id:channel_id,
            college:college,
            course:course,
           
        })
      })
      .then((response) => response.json())
      .then(result=>{   
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      }); 
  }
joinchannel=(cid,user)=>{   
      firebase.database().ref('channels').child(cid).child('users').child(user.uid).set(user.uid).then(()=>{
        firebase.database().ref('users').child(user.uid).child("channnels").child(cid).set({id:cid});  
         this.addUserToChannelMysql(user.uid,cid)
         isMobile?window.JSInterface.addChannel(cid):null; 
      }).catch((e)=>{
        console.log(e)
      });  
  } 

  saveUser = createdUser => {
    let fcm = isMobile?window.JSInterface.setUser(createdUser.user.uid):null; 
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
      fcmtoken:{[fcm]:1}
    });
  };

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading,
      phone
    } = this.state;  
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
        <Image src={LOGO} spaced="right"   className="logo" />
          <Header as="h1" icon color="violet" textAlign="center"> 
            Register for DuBuddy
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                value={username}
                type="text"
              /> 
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
                name="phone"
                icon="phone"
                iconPosition="left"
                placeholder="Mobile Number"
                onChange={this.handleChange}
                value={phone}
                className={this.handleInputError(errors, "mobile")}
                type="number"
              /> 
              <Dropdown
                  placeholder='Select College'
                  fluid
                  style={{marginTop:10,marginBottom:10}}
                  name="college"
                  search 
                  selection
                  onChange={this.handleChange}
                  options={this.state.colleges}
                />
              <Dropdown
                  placeholder='Select Course'
                  fluid
                  name="course"
                  search
                  style={{marginBottom:10}}
                  selection
                  onChange={this.handleChange}
                  options={this.state.courses}
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
              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                value={passwordConfirmation}
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
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
