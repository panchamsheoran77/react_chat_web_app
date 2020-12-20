import React from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";
import { toggelSideBar,setMetaDispaly } from "../../actions";
import { connect } from "react-redux"; 
import {isMobile} from "react-device-detect";
import firebase from "../../firebase";
class MessagesHeader extends React.Component {
  
  state={searchInput:false,
    isNotificationOn:true,
    channelNodeId:null
  }
  
  componentDidMount(){

    this.getChannelNotificationStatus();
   
  }
  getChannelNotificationStatus = ()=>{
    if(this.props.channel && this.props.user_id)
    {
        firebase.database().ref("users").child(this.props.user_id).child("channnels").orderByChild("id").equalTo(this.props.channel.id).once("value",snap=>{
          let  snapObject = snap.val(); 
          if(snapObject)
          {
              if( Object.values(snapObject)[0].noti!=1)
              {
                this.setState({isNotificationOn:false,channelNodeId:Object.keys(snapObject)[0]}); 
              }
              else
              {
                this.setState({isNotificationOn:true,channelNodeId:Object.keys(snapObject)[0]}); 
              } 
          }  
        }); 
    }
   
   
  
  } 

  handleNotification = ( )=>{
    if(this.state.isNotificationOn)
    {
      console.log(this.state.channelNodeId);
      firebase.database().ref("users").child(this.props.user_id).child("channnels").child(this.state.channelNodeId).update({noti:0}).then(()=>{
        window.JSInterface.removeChannel(this.props.channel.id);
        console.log("muted : "+!this.state.isNotificationOn)
        this.setState({isNotificationOn:!this.state.isNotificationOn})
      })
    }
    else
    {
      firebase.database().ref("users").child(this.props.user_id).child("channnels").child(this.state.channelNodeId).update({noti:1}).then(()=>{
        window.JSInterface.addChannel(this.props.channel.id);
        console.log("on : "+!this.state.isNotificationOn)
        this.setState({isNotificationOn:!this.state.isNotificationOn})
      })
    }
    
  }
  render() { 
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel,
      handleStar,
      isChannelStarred 
    } = this.props;
   
    return (
      <Segment clearing style={{ marginBottom: 0,padding:0}}>
        {/* Channel Title */}
        <Header fluid="true" as="h2" floated="left" style={{marginRight:0}} >
          <span>
            <Icon name="bars" onClick={()=>this.props.toggelSideBar(true)}/>
            <span className="channelName" onClick={()=>this.props.setMetaDispaly(true)}>{isMobile?channelName.length>19?channelName.substring(0,19)+"...":channelName:channelName}</span>
            {!isPrivateChannel && channelName&& ( 
              <Icon
                onClick={handleStar}
                name={isChannelStarred ? "star" : "star outline"}
                color={isChannelStarred ? "yellow" : "black"}
              /> 
              

            )} 
            {isMobile&&channelName  ?(
            <Icon onClick={this.handleNotification}
                  name={this.state.isNotificationOn?"volume up":"volume off"}
                  color={this.state.isNotificationOn ? "blue" : "black"}
                  />):null}
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header> 
        {/* Channel Search Input */}
        <Header className="headerSearchBar">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
            className="headerSearchInput"
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
          />
        </Header>
        
      </Segment>
    );
  }
}

export default connect(null,{toggelSideBar,setMetaDispaly})(MessagesHeader);
