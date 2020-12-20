import React from "react";
import moment from "moment";
import { Comment, Image } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import {setReplyBox,setReplyMsg,setReplyImage,setMessageInfoVisible,setMessageRef} from "../../actions";
class Message extends React.Component
{
    state={
      messageClass:'message_self_block',
      swipeBy:"",
      reply:false
    }
    componentDidMount()
    {
      this.msg_seen_check();
    }
      isOwnMessage = (message, user) => { 
        // console.log(message)
      return message.user.id === user.uid ? "message__self" : ""; 
    };
    
      isImage = message => {
      return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
    };
    
    timeFromNow = timestamp => moment(timestamp).format('h:mm a');

    msg_seen_check=()=>{
      firebase.database().ref('privateMessages').child(this.props.channelId).child(this.props.message.msg_key).child('status').on('value',snap=>{ 
          if(snap.val()==1)
          {
            this.setState({messageClass:"message_self_block_seen"})
          }
      });
    }
    clickHoldTimer = null;
    handleTouchStart=(e,status,isOwn)=>{  
      console.log("starte status : "+status)
      if(!status && isOwn)
      { 
          this.clickHoldTimer = setTimeout(() => { 
          this.props.setMessageRef(firebase.database().ref('messages').child(this.props.channelId).child(this.props.message.msg_key))
          this.props.setMessageInfoVisible(true)
          }, 1000); 
      } 
    }
  
    handleTouchMove_self = (e)=>{ 
      clearTimeout(this.clickHoldTimer);
      let x = e.touches[0].clientX-e.target.offsetLeft; 
      if(x>0)
      {
        this.setState({swipeBy:0});
      }
      else
      {
        this.setState({swipeBy:x})
      }
      if(x<=-50)
      {
        x=0;
        this.setState({reply:true}) 
      } 
    }
    handleTouchEnd = (message)=>{  
        clearTimeout(this.clickHoldTimer); 
        if(this.state.reply)
        {
          this.props.setReplyBox(true); 
          if(this.isImage(message))
          {
            this.props.setReplyImage(true);
            this.props.setReplyMsg(message.image)

          }
          else
          {
            this.props.setReplyImage(false);
            this.props.setReplyMsg(message.content)
          }
        }
        this.setState({swipeBy:0,reply:false});
    }
     
    handleTouchMove = (e)=>{ 
       clearTimeout(this.clickHoldTimer);
      let x = e.target.offsetLeft-e.touches[0].clientX;  
      if(x>0)
      {
        this.setState({swipeBy:0});
      }
      else
      {
        this.setState({swipeBy:x})
      }
      if(x<=-80)
      {
        x=0;
        this.setState({reply:true})
      } 
    }
    isReply = message=>{
      if(message.replied==1)
      {
        return true;
      }
        return false;
    }
    isReplyImage = message=>{ 
        return message.reply.hasOwnProperty("image") && !message.reply.hasOwnProperty("msg"); 
    }
    render(){
      const  { message, user,isPrivateChannel } = this.props;
      
      let isOwnMessage = this.isOwnMessage(message,user);
      let isReply = this.isReply(message);
      let isImage ; 
        if(isOwnMessage)
        {
            isImage = this.isImage(message);
            return ( 
              <Comment className={isOwnMessage}
                  style={{left: this.state.swipeBy}}>
                <div className={isImage?`message__image_Container ${this.state.messageClass}`:this.state.messageClass}
                  onTouchStart={touchStartEvent => this.handleTouchStart(touchStartEvent,isPrivateChannel,true)}
                  onTouchMove={touchMoveEvent => this.handleTouchMove_self(touchMoveEvent)}
                  onTouchEnd={() => this.handleTouchEnd(message)}
                > 
                  <Comment.Content className={isImage?'message__image_Container':''}> 
                      {isReply?(
                        this.isReplyImage(message)? (
                          <Image src={message.reply.image}  className="message__imageSelfReply" />
                          ):(
                          <Comment.Text className="message_self_textReply">{message.reply.msg}</Comment.Text>
                        )
                      ):(null)}
                      {isImage ? (
                        <Image src={message.image} onClick={()=>{this.props.showImageFunction(message.image)}} className="message__imageSelf" />
                        ):(
                        <Comment.Text className="message_self_text">{message.content}</Comment.Text>
                      )}
                    <Comment.Metadata className="selfTimeMeta">{this.timeFromNow(message.timestamp)}</Comment.Metadata> 
                  </Comment.Content>
                </div> 
              </Comment>
            )
              
        }else
        {
            isImage = this.isImage(message);
            return (
              <Comment
                style={{right:this.state.swipeBy}}
               >
                <div className={isImage?'message__image_Container message_block':' message_block'} 
                   onTouchStart={touchStartEvent => this.handleTouchStart(touchStartEvent,isPrivateChannel,false)}
                   onTouchMove={touchMoveEvent => this.handleTouchMove(touchMoveEvent)}
                   onTouchEnd={() => this.handleTouchEnd(message)}
                > 
                  <Comment.Content>
                    <div className="message_meta">
                        <div as="a" style={{fontWeight: '100 !important', color:"yellow !important"}}>{message.user.name}</div> 
                    </div>
                    {isReply?(
                        this.isReplyImage(message) ? (
                          <Image src={message.reply.image}  className="message__imageReply" />
                          ):(
                          <Comment.Text className="message_textReply">{message.reply.msg}</Comment.Text>
                        )
                      ):(null)}
                    {isImage ? (
                        <Image src={message.image} onClick={()=>{this.props.showImageFunction(message.image)}} className="message__image" />
                    ) : (
                      <Comment.Text className="message_text">{message.content}</Comment.Text>
                    )}
                    <Comment.Metadata className='timeMeta' >{this.timeFromNow(message.timestamp)}</Comment.Metadata> 
                  </Comment.Content>
                </div> 
              </Comment>
            )
        } 
    }  
  
}

export default connect(null,{setReplyBox,setReplyMsg,setReplyImage,setMessageInfoVisible,setMessageRef})(Message);
