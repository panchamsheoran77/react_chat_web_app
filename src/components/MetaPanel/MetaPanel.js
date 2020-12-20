import React from "react";
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List,
  Button
} from "semantic-ui-react";
import {isMobile} from "react-device-detect";
import { setMetaDispaly,setCurrentChannel, setPrivateChannel,setUserBlockStatus } from "../../actions";
import { connect } from "react-redux";
import firebase from "../../firebase";  

class MetaPanel extends React.Component {
  state = {
    channel: this.props.currentChannel,
    privateChannel: this.props.isPrivateChannel,
    activeIndex: 0,
    channelUsers:[],
    channelUsersCount:0,
    currentUser:this.props.currentUser,
    channelcode:'',
    loading:false
  };


  componentDidMount() {
    if(!this.state.privateChannel)
    {
      this.displayChannelUsers();
      this.displayChannelCode();
    }
     
  }
  displayChannelUsers = ()=>{ 
      let channelUserCount=0;
      let x=[];  
      let user; 
      let uid
     
        firebase.database().ref('channels').child(this.state.channel.id).child("users").on("child_added",snap=>{
            firebase.database().ref('users').child(snap.val()).once('value',userdata=>{ 
              user =  {...userdata.val(),uid : userdata.key}; 
              uid = userdata.key;  
              channelUserCount++;  
              x.push(user)
              this.setState({
                channelUsers:x,
                channelUsersCount:channelUserCount
              }) 
            })
        }); 
  }

  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  formatCount = num => (num > 1 || num === 0 ? `${num} posts` : `${num} post`);

  // displayTopPosters = posts =>
  //   Object.entries(posts)
  //     .sort((a, b) => b[1] - a[1])
  //     .map(([key, val], i) => (
  //       <List.Item key={i}>
  //         <Image avatar src={val.avatar} />
  //         <List.Content>
  //           <List.Header as="a">{key}</List.Header>
  //           <List.Description>{this.formatCount(val.count)}</List.Description>
  //         </List.Content>
  //       </List.Item>
  //     ))
  //     .slice(0, 2);
  changeChannel = (uid,name) => {
    if(uid!=this.state.currentUser.uid)
    { 
      const channelId = this.getChannelId(uid);
      const channelData = {
        id: channelId,
        name: name
    }; 
      firebase.database().ref("users").child(this.state.currentUser.uid).child('friends').child(uid).child('status').once("value",snap=>{
        if(snap.val()!=undefined)
        {
          firebase.database().ref("users").child(this.state.currentUser.uid).child('friends').child(uid).set({id:uid,status:snap.val()});
        }
        else
        {
          firebase.database().ref("users").child(this.state.currentUser.uid).child('friends').child(uid).set({id:uid,status:0});
        } 
      });
      firebase.database().ref("users").child(uid).child('friends').child(this.state.currentUser.uid).child('status').once("value",snap=>{
        if(snap.val()!=undefined)
        {
          firebase.database().ref("users").child(uid).child('friends').child(this.state.currentUser.uid).set({id:this.state.currentUser.uid,status:snap.val()});
        }
        else
        {
          firebase.database().ref("users").child(uid).child('friends').child(this.state.currentUser.uid).set({id:this.state.currentUser.uid,status:0});
           
        }
      });
      
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(uid);
        this.props.setMetaDispaly(false); 
         
    } 
  };

  getChannelId = userId => { 
    const currentUserId = this.state.currentUser.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`; 
  };

  setActiveChannel = userId => {
    this.setState({ activeChannel: userId });
  };

  blockuser=channel=>{
    let fid;
    
    channel.id.split('/').filter(id=>{
      if(id!=this.state.currentUser.uid)
      {
        fid = id;
        if(this.props.isBlocked){
          firebase.database().ref('users').child(this.state.currentUser.uid).child('friends').child(fid).update({status:0}).then(()=>{
            this.props.setUserBlockStatus(false);
         });
        }
        else
        {
          firebase.database().ref('users').child(this.state.currentUser.uid).child('friends').child(fid).update({status:1}).then(()=>{
             this.props.setUserBlockStatus(true);
          });
        } 
        return id;
      }
    });

  }

  displayChannelCode =()=>{
    let channelcode;
      firebase.database().ref('channels').child(this.state.channel.id).child('channelcode').once('value',snap=>{
        channelcode = snap.val(); 
        this.setState({
          channelcode:channelcode
        })
      })
  }
  handleRemove = ()=>{
    this.setState({loading:true})
    firebase.database().ref('channels').child(this.state.channel.id).child('users').child(this.state.currentUser.uid).remove().then(()=>{
      firebase.database().ref("users").child(this.state.currentUser.uid).child("channnels").orderByChild('id').equalTo(this.state.channel.id).once("value",snap=>{
        firebase.database().ref("users").child(this.state.currentUser.uid).child("channnels").child(Object.keys(snap.val())[0]).remove().then(()=>{
           isMobile?window.JSInterface.removeChannel(this.state.channel.id):null
           window.location.reload(false);
          });
     })
    }
      
    )

  }
  render() {
    const { activeIndex, privateChannel, channel,loading } = this.state;
    // const { numUniqueUsers } = this.props; 
    // this.displayChannelUsers();  
    return privateChannel?(
      <Segment loading={!channel}>
         <div className="metaclose" style={{float:'right'}} >
                  <Icon name="close"  className="black" style={{color:"black"}} onClick={()=>this.props.setMetaDispaly(false)}/> 
        </div>
         <div className="metaHeader">
              @{channel && channel.name}  
          </div>
       
          <Button
            inverted 
            color={this.props.isBlocked?"green":"red"}
            onClick={()=>this.blockuser(channel)}> 
           {this.props.isBlocked?"Unblock":"Block"} User
          </Button>
          
         
      </Segment>
    ):(
      <Segment loading={!channel}>
          <div className="metaclose" style={{float:'right'}}>
                  <Icon name="close" onClick={()=>this.props.setMetaDispaly(false)}/> 
          </div>  
          <div className="metaHeader">
              #{channel && channel.name}   
              <div className="metaChannelCode">
                     {this.state.channelcode?"Code : "+ this.state.channelcode:null}
              </div>
          </div> 
        <div className="metaSubItemsContainer">
          <div className="metaChannelDesContainer"> 
              <div className="metaSubHeading">Description</div>  
              <div  className="metaChannelDes">
                {channel && channel.details}  
              </div> 
          </div>
          <div className="metaChannelDesContainer"> 
              <div className="metaSubHeading"> Channel Users({this.state.channelUsersCount})</div>  
              <div  className="metaChannelUsers">
                  <List>{this.state.channelUsers.map(user=>(
                    <List.Item key={user.uid}>
                      <Image avatar src={user.avatar} /> 
                      <List.Content>
                        <List.Header as="a" onClick={()=> this.changeChannel(user.uid,user.name)}>{user.name}</List.Header> 
                      </List.Content>
                    </List.Item>
                ))}</List>
              </div> 
          </div> 
        
        </div>
        <Button disabled={loading}  className={loading ? "loading" : ""} color="red" onClick={this.handleRemove}>
                  Leave Channel
        </Button>
      </Segment>
    );
  }
}
const mapStateToProps = state => ({
  
  isBlocked:state.meta.isBlocked,
  
});
export default connect(mapStateToProps,{setMetaDispaly,setCurrentChannel,setPrivateChannel,setUserBlockStatus})(MetaPanel);
