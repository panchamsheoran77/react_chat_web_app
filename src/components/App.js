import React from "react";
import { Grid,Segment,Sidebar,Menu, Modal } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux"; 
// import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import { toggelSideBar,SetUrlChannelId } from "../actions";
import MessageInfo from "./Messages/MessageInfo";  

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts, secondaryColor,visible,toggelSideBar,isMetaVisible,isMsgInfoVisible,msgRef,match,SetUrlChannelId }) =>{
  const id = match.params.id  
  if(id!=undefined)
  {
    console.log("app js : "+id);
    // let cid = id.replace("&","/")
    let cId = id.replace("&","/")
    SetUrlChannelId(cId)
  }
  return( 
    <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            animation='overlay'
            icon='labeled'
            className="hamburgerMenu"
            inverted
            onHide={() => toggelSideBar(false)}
            vertical
            visible={visible}
            width='thin'>
            <SidePanel
              style={{marginTop:30}}
              key={currentUser && currentUser.uid}
              currentUser={currentUser}
              UrlChannelId={id}
              primaryColor={'rgba(0,0,0)'}
            />
          </Sidebar>
          <Sidebar.Pusher style={{width:"100vw",overflowY:'hidden'}}> 
              <Messages 
                style={{maxHeight:'100%'}}
                key={currentChannel && currentChannel.id}
                currentChannel={currentChannel}
                currentUser={currentUser}
                isPrivateChannel={isPrivateChannel}
              />
          </Sidebar.Pusher>
      </Sidebar.Pushable> 
    <Modal basic open={isMetaVisible} >
      <Modal.Content>
          <MetaPanel
          key={currentChannel && currentChannel.name}
          userPosts={userPosts} 
          currentUser={currentUser}
          currentChannel={currentChannel}
          isPrivateChannel={isPrivateChannel}
        />
      </Modal.Content> 
    </Modal> 
    <Modal basic open={isMsgInfoVisible} >
      <Modal.Content>
          <MessageInfo
          msgRef={msgRef}
          isPrivateChannel={isPrivateChannel}
        />
      </Modal.Content> 
    </Modal> 
    </Grid>
  ); 
} 

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts, 
  secondaryColor: state.colors.secondaryColor,
  visible:state.channel.visible,
  isMetaVisible:state.meta.isMetaVisible, 
  isMsgInfoVisible:state.message.isMsgInfoVisible,
  msgRef:state.message.msgRef
}); 
export default connect(mapStateToProps,{toggelSideBar,SetUrlChannelId})(App); 