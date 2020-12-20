import React from "react";
import { Comment,Modal,Message as InfoBox } from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserBlockStatus,setPreviousChannelListeners,removePreviousChannelListeners,setReplyBox,setReplyImage,setReplyMsg,setPrivateChannel } from "../../actions";
import firebase from "../../firebase";
import moment from "moment";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Typing from "./Typing";
import Skeleton from "./Skeleton";
import FullScreenImage from "./FullScreenImage";

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    isChannelStarred: false,
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    numUniqueUsers: this.props.numUniqueUsers,
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    typingRef: firebase.database().ref("typing"),
    typingUsers: [],
    connectedRef: firebase.database().ref(".info/connected"),
    listeners: [],
    blockStatusMy:false,
    blockStatusFriend:false,
    fid:'',
    msgImage:'',
    showImage:false,
    msgKeyToload:"",
    scroll:true,
    isMore:true,
    swipeBy:0,
    noMessages:false, 
  };
  loadedMessages = [];
  componentDidMount() { 
    
    const { channel, user, listeners } = this.state; 
    if (channel && user) {
      this.removeListeners(listeners);
      if(this.props.previousChannelListener)
      {
        this.removeListeners(this.props.previousChannelListener);
        this.props.removePreviousChannelListeners()
        this.props.setReplyBox(false);
        this.props.setReplyMsg("");
        this.props.setReplyImage(false);
        this.props.setUserBlockStatus(false);
      }
      
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user.uid);
      if(this.state.privateChannel)
      {
         this.isblocked(channel);
      }
     
    }
  }

  componentWillUnmount() {

    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();     
  }

  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event); 
    });   
  };
   updateCounter=0;
  componentDidUpdate(prevProps, prevState) {
  
    if (this.messagesEnd && this.state.scroll) {
      this.scrollToBottom();
    }
    if(!this.state.scroll)
    {  
      this.updateCounter++;
    }
    if(this.updateCounter>51)
    {
      
      this.updateCounter=0;
      this.setState({scroll:true})
    }
   
  }

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) }); 
      this.props.setPreviousChannelListeners(newListener);
    }
    
};
  displayImageModal=(image)=>{
    this.setState({showImage:true,msgImage:image})
  }
  hideImageModal=()=>{
    this.setState({showImage:false})
  }

  scrollToBottom = () => {
    // window.scrollTo(0, this.messagesEnd.offsetHeight)
    // this.messagesEnd.scrollIntoView({ behavior: "smooth",block: 'end'});
    this.messagesContainer.scrollTop=this.messagesEnd.offsetTop-10; 
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListeners(channelId);
  }; 

  addTypingListeners = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_added");

    this.state.typingRef.child(channelId).on("child_removed", snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_removed");

    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.error(err); 
            }
          });
      }
    });
  };
  
  addMessageListener = channelId => { 
    let msg_key;
    let i=0;
    const ref = this.getMessagesRef();
    ref.child(channelId).limitToLast(50).on("child_added", snap => {
      msg_key = snap.key; 
      this.loadedMessages.push({...snap.val(),msg_key:msg_key});
      if(!this.state.privateChannel)
      {
        if(!snap.child("seenBy").hasChild(this.state.user.uid))
        {
          this.state.messagesRef.child(this.state.channel.id).child(msg_key).child('seenBy').child(this.state.user.uid).set(1);
         
        } 
   
      } 
      if(i===0)
      {
        this.setState({
          messages: this.loadedMessages,
          messagesLoading: false,
          msgKeyToload:snap.val().timestamp
        });
        i++;
      }
      else
      {
        this.setState({
          messages: this.loadedMessages,
          messagesLoading: false
        });
      } 
    });

    setTimeout(()=>{
      if(i==0)
      {
        
        this.setState({messagesLoading:false,noMessages:true})
      }
      
    },5000);

    this.addToListeners(channelId, ref, "child_added");
  };
  
  loadMoreMessages = (channelId,msg_time) => {
    
    let msg_key;
    let timestmap;
    let loadedMessages=[];
    let messageObject;
    let i=1;
    const ref = this.getMessagesRef(); 
    ref.child(channelId).orderByChild("timestamp").endAt(msg_time).limitToLast(50).once("value", snap => {
      if(snap)
      {
        messageObject =  Object.entries(snap.val());
        messageObject.pop();
        messageObject.map(item=>{ 
            msg_key = item[0];
            loadedMessages.push({...item[1],msg_key:msg_key}); 
            if(i===1)
            { 
              timestmap=item[1].timestamp; 
            } 
            i++;
          })
          this.updateCounter=50; 
          if(i<50)
          {
              this.loadedMessages = loadedMessages.concat(this.loadedMessages);
              this.setState({
                messages: this.loadedMessages, 
                msgKeyToload:timestmap, 
                scroll:false,
                isMore:false
              });
          }
          else
          {
            this.loadedMessages = loadedMessages.concat(this.loadedMessages);
            this.setState({
            messages: this.loadedMessages, 
            msgKeyToload:timestmap, 
            scroll:false, 
          });
          }
          
          
          i++; 
      }
        
      
    });
     

     
  };
  changeMessageStatus =(channelId)=>{ 
    let msg_id; 
    let msg_object;
    firebase.database().ref().child('unread').child(channelId).child(this.state.user.uid).once("value",snap=>{
      // console.log(snap.val())
      msg_object=snap.val();
      if(msg_object)
      {
            Object.entries(msg_object).map(item=>{ 
            msg_id = item[0];
            this.state.privateMessagesRef.child(channelId).child(msg_id).child('status').set(1).then(()=>{
                  firebase.database().ref('unread').child(channelId).child(this.state.user.uid).child(msg_id).remove((e)=>{ 
                  })
                }).catch((e)=>{
                  console.log(e)
                });
          });
      }
      
      
    });
    
 }

  addUserStarsListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleStar = () => {
    this.setState(
      prevState => ({
        isChannelStarred: !prevState.isChannelStarred
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar
          }
        }
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };
  checkDate=timestamp=>{
      
      moment().format('DD-MM-YYYY')== moment(timestamp).format('DD-MM-YYYY');
    }
 
 
  displayMessages = messages =>{
    let previousTimestamp=0; 
    let x= messages.length > 0 &&
    messages.map(message => 
    {  
      
      if(moment(previousTimestamp).format('DD-MM-YYYY')!=moment(message.timestamp).format('DD-MM-YYYY'))
      {
        previousTimestamp=message.timestamp
        return(
          <div  key={message.timestamp}>
              <div style={{textAlign:'center'}}> 
                {moment(message.timestamp).format('DD-MM-YYYY')} 
              </div>

            <Message  
              isPrivateChannel={this.state.privateChannel}
              message={message}
              user={this.state.user}
              channelId={this.state.channel.id} 
              showImageFunction={this.displayImageModal} 
            /> 
          </div>
          
        )
      }
      else
      {
        return (
                <Message 
                    isPrivateChannel={this.state.privateChannel}
                    key={message.timestamp}
                    message={message}
                    channelId={this.state.channel.id}
                    showImageFunction={this.displayImageModal} 
                    user={this.state.user} /> 
              )
      }  
    }
    ); 
    if(this.state.privateChannel &&this.state.channel &&this.changeMessageStatus(this.state.channel.id));
   
    return x;
  } 
  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };
  loadMore = ()=>{
    // messagesStart;
    if(this.messagesContainer.scrollTop<=10&&!this.state.messagesLoading&&!this.state.noMessages)
    {
  
      if(this.state.isMore)
      {
        if(this.state.channel)
        {
            this.loadMoreMessages(this.state.channel.id,this.state.msgKeyToload);
        }
          
      }  
    }
    
  }
   isblocked = channel=>{
     let fid; 
    if(this.state.privateChannel){
       channel.id.split('/').filter(id=>{
          if(id!=this.state.user.uid)
          {
            fid = id;
            this.setState({fid:id});
            return id;
          }
        });
        let status ;
        let statusf ; 
        this.state.usersRef.child(this.state.user.uid).child('friends').child(fid).child('status').on('value',snap=>{
          status = snap.val()==0?false:true; 
          this.props.setUserBlockStatus(status);
          this.setState({blockStatusMy:status});  
        }); 
        this.state.usersRef.child(fid).child('friends').child(this.state.user.uid).child('status').on('value',snapf=>{
          statusf = snapf.val()==0?false:true; 
          this.setState({blockStatusFriend:statusf});
        }); 
    }else{
      // this.setState({blockStatus:false});
      this.setState({blockStatus:false});
    }
   }

  displayTypingUsers = users =>
    users.length > 0 &&
    users.map(user => (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span> <Typing />
      </div>
    ));

  displayMessageSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  render() {
    // prettier-ignore
    const { messagesRef, messages, channel, user, searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred, typingUsers, messagesLoading,blockStatusMy,blockStatusFriend,noMessages } = this.state;
    // window.JSInterface.consoleLog(window.JSInterface.getFCMToken())  
     
    return (
      <React.Fragment>
          <MessagesHeader 
            channelName={this.displayChannelName(channel)} 
            handleSearchChange={this.handleSearchChange}
            searchLoading={searchLoading}
            channel={channel}
            user_id={user.uid}
            isPrivateChannel={privateChannel}
            handleStar={this.handleStar}
            isChannelStarred={isChannelStarred}
          />

        <div style={{marginLeft:10,marginRight:10,overflowY:"auto"}}
          onScroll={this.loadMore} 
          ref={node => (this.messagesContainer = node)}>
          <Comment.Group className="messages" >  
            {this.displayMessageSkeleton(messagesLoading)} 
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div  ref={node => (this.messagesEnd = node)} />
            {((blockStatusMy==true)||(blockStatusFriend==true))?(
              <InfoBox color="red" className="blockedContainer">
                <p className="blocked">Blocked</p>
              </InfoBox>
            ):(
            <MessageForm
              messagesRef={messagesRef}
              currentChannel={channel}
              currentUser={user}
              scrollFunction={this.scrollToBottom}
              isPrivateChannel={privateChannel}
              getMessagesRef={this.getMessagesRef} 
              />
              )}
          </Comment.Group> 
        </div> 
        
           <Modal basic open={this.state.showImage} >
            <Modal.Content>
                <FullScreenImage 
                   image={this.state.msgImage} 
                   hideImageFunction={this.hideImageModal}
                />
            </Modal.Content> 
          </Modal>
      </React.Fragment>
    );
  }
}


const mapStateToProps = state => ({
  previousChannelListener:state.channel.previousChannelListeners
}); 

export default connect(mapStateToProps,{setPreviousChannelListeners,removePreviousChannelListeners,setReplyBox,setReplyImage,setReplyMsg,setUserBlockStatus,setPrivateChannel})(Messages)
