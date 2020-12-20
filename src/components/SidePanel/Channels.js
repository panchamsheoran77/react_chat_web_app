import React from "react"; 
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel,SetUrlChannelId } from "../../actions";
// import { stringHash } from 'string-hash'
// prettier-ignore
import { Menu, Icon, Modal, Form, Input, Button, Label } from "semantic-ui-react";
import {isMobile} from "react-device-detect"; 
const stringHash = require("string-hash");
class Channels extends React.Component {
  state = {
    activeChannel: "",
    user: this.props.currentUser,
    channel: null,
    channels: [],
    channelName: "",
    channelDetails: "",
    channelcode:"",
    channelsRef: firebase.database().ref("channels"),
    userRef:firebase.database().ref('users'),
    messagesRef: firebase.database().ref("messages"),
    typingRef: firebase.database().ref("typing"),
    notifications: [],
    modal: false,
    firstLoad: true
  };

  componentDidMount() {

    if(this.props.urlChannelId)
    {
      let ouid;
      if(this.props.urlChannelId.includes("/"))
      {
        this.props.urlChannelId.split("/").map(item=>{
            if(item!=this.state.user.uid)
            {
              ouid=item; 
            }
        });
        firebase.database().ref('users').child(ouid).once("value",snap=>{
            this.changeToUrlPrivateChannel(ouid,snap.val().name,this.props.urlChannelId);
          });
      }
      else
      {
          firebase.database().ref('channels').child(this.props.urlChannelId).once("value",snap=>{
              this.changeChannel(snap.val(),false);
            });
      }
      
    }
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
  
    let loadedChannels = [];
    let ckey;
    this.state.userRef.child(this.state.user.uid).child('channnels').on("child_added", snap => {
      
      ckey = snap.child('id').val()  
      
      this.state.channelsRef.child(ckey).once('value',cdata=>{
        loadedChannels.push(cdata.val());
        this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
        this.addNotificationListener(snap.child('id').val());
      })
      
    });

  };

  addNotificationListener = channelId => {
    this.state.messagesRef.child(channelId).on("value", snap => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      notification => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach(channel => {
      this.state.messagesRef.child(channel.id).off();
    });
  }; 
  setFirstChannel = () => {
    if(!this.props.urlChannelId)
    {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad && this.state.channels.length > 0) {
          this.props.setCurrentChannel(firstChannel);
          this.setActiveChannel(firstChannel);
          this.setState({ channel: firstChannel });
        }
        this.setState({ firstLoad: false });
    }
   
  }; 
  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

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
    let channelcount;
    let channelhashcode;
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        // channelsRef.child(key).child("users").push(user.uid);
        firebase.database().ref('users').child(user.uid).child("channnels").push().update({id:key});
        firebase.database().ref().child('channelcount').once('value',count=>{
            channelcount = count.val()+1; 
            firebase.database().ref().update({channelcount:channelcount}).then(()=>{
              channelhashcode = stringHash("dubc"+channelcount); 
              firebase.database().ref('channelCodes').child(channelhashcode).set({id:key}).then(()=>{
                channelsRef.child(key).update({channelcode:channelhashcode});
                  this.changeChannel(newChannel)
                  this.addChannelToMysql(channelName,channelDetails,channelhashcode,user.uid,key);
                 isMobile?window.JSInterface.addChannel(key):null;
              });
              
            });
            

        })
        // firebase.database().ref('channels').child(key).update({channelcode:});
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal(); 
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };
  handleJoinSubmit = event=>{
    event.preventDefault();
    if(this.isFormValidJoin(this.state))
    {
      this.joinchannel();
    }
  }
  joinchannel=()=>{
    let code = this.state.channelcode;
    let cid;
    firebase.database().ref('channelCodes').child(code).child('id').once('value',snap=>{
      cid = snap.val(); 
      firebase.database().ref('channels').child(cid).child('users').child(this.state.user.uid).set(this.state.user.uid).then(()=>{
        firebase.database().ref('users').child(this.state.user.uid).child("channnels").child(cid).set({id:cid});
        firebase.database().ref('channels').child(cid).once("value",snap=>{
         this.closeModal();
         this.changeChannel(snap.val());
         this.addUserToChannelMysql(this.state.user.uid,cid)
         isMobile?window.JSInterface.addChannel(cid):null;
      });  
      }).catch((e)=>{
        console.log(e)
      }); 
    }); 
  }
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeChannel = (channel,changeFactor=true) => {
    this.setActiveChannel(channel); 
    this.props.setPrivateChannel(false); 
    if(changeFactor)
    {
      this.props.SetUrlChannelId(null)
    }
    if(this.state.channel)
    {
        this.state.typingRef
          .child(this.state.channel.id)
          .child(this.state.user.uid)
          .remove();
    }
        
    
   
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.setState({ channel });


  };
  
  changeToUrlPrivateChannel = (uid,name,cid) => { 
    this.props.setPrivateChannel(true);
      const channelId = cid;
      const channelData = {
        id: channelId,
        name: name
      };  
        this.props.setCurrentChannel(channelData);
        
        this.setActiveChannel(uid);
      
         
    
  };

  

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.state.channel.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  getNotificationCount = channel => {
    let count = 0;

    this.state.notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };


  addChannelToMysql=(name,des,channel_code,user_id,channel_id)=>
   {

      fetch('https://dubuddy.in/appapis/add_channel.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
            addChannelOfficial: 'true',
            admin:user_id,
            channel_id:channel_id,
            channel_code:channel_code,
            des:des,
            name:name,
            college:"N.A.",
            course:"N.A." 
        })
      })
      .then((response) => response.json())
      .then(result=>{  
        this.addUserToChannelMysql(user_id,channel_id)
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      }); 
   }
  addUserToChannelMysql=(user_id,channel_id)=>
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
           channel_id:channel_id 
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
  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  isFormValid = ({ channelName, channelDetails }) =>channelName && channelDetails;

  isFormValidJoin = ({ channelcode}) =>channelcode;
  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { channels, modal } = this.state;
      // firebase.database().ref('channels/'+user.uid).once('value').then(function(snap)
      // {
      //   console.log(snap.child("name").val());
      // })
    return (
      <React.Fragment>
        <Menu.Menu className="menu"  >
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <span style={{fontSize: "100%!important" }}> <Icon name="add" onClick={this.openModal} /></span>
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        {/* Add Channel Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          {/* create channel */}
          <Modal.Header>Create Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Channel Name"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field> 
              <Form.Field>
                <Input
                  fluid
                  label="Description"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form> 
          </Modal.Content> 
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" />Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions> 
          {/* join channel */}
          <Modal.Header>Join Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleJoinSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Channel Code"
                  name="channelcode"
                  onChange={this.handleChange}
                 />
              </Form.Field> 
            </Form> 
          </Modal.Content> 
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleJoinSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions> 
          
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  urlChannelId: state.channel.urlChannelId,
   
}); 
 
export default connect(mapStateToProps,{ setCurrentChannel, setPrivateChannel,SetUrlChannelId })(Channels);
