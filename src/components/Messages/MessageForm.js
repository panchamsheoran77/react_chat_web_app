import React from "react";
import uuidv4 from "uuid/v4";
import firebase from "../../firebase";
import {Button, Input, Grid, Icon, Image } from "semantic-ui-react";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import Notification from '../Notification/Notification'; 
import ProgressBar from "./ProgressBar";  
import mime from "mime-types";
import { connect } from "react-redux";
import imageCompression from 'browser-image-compression';
import {setReplyBox,setReplyImage,toggelSideBar} from "../../actions"; 
class MessageForm extends React.Component {
  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [], 
    emojiPicker: false,
    file: null,
    authorized: ["image/jpeg", "image/png"] 
  };

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }
  componentDidMount(){
    // this.props.scrollFunction();
  }
   
  openModal = () => {
    // this.setState({ modal: true })
    this.fileInputRef.click();
  }

  // closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleKeyDown = event => {
    this.props.scrollFunction()
    if ((event.ctrlKey && event.keyCode === 13 )||event.key==='Enter') {
      this.sendMessage();
    }

    const { message, typingRef, channel, user } = this.state;

    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  createMessage = (fileUrl = null) => {
    
    let replied =0;
    let replyMsg;
    let message;
    
    if(this.props.replyBox)
    {
        if(this.props.isReplyImage)
        {
          replyMsg={
            image:this.props.replyText
          }
          this.props.setReplyImage(false);
        }
        else
        {
          replyMsg={
            msg:this.props.replyText
          }
        }
        replied=1;
        this.props.setReplyBox(false)
        message = {
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          replied:replied,
          user: {
            id: this.state.user.uid,
            name: this.state.user.displayName,
            avatar: this.state.user.photoURL
          },
          reply:replyMsg 
        };
    }
    else
    {
      message = {
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        replied:replied,
        user: {
          id: this.state.user.uid,
          name: this.state.user.displayName,
          avatar: this.state.user.photoURL
        } 
      };
    } 

    
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = () => { 
    const { getMessagesRef } = this.props;
    const { message, channel, user, typingRef } = this.state;
    let key;  
    if (message) {
      this.setState({ loading: true });
       key =  getMessagesRef()
        .child(channel.id)
        .push().key

        getMessagesRef().child(channel.id).child(key).update(this.createMessage())
        .then(() => { 
          this.props.scrollFunction();
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
            if(this.props.isPrivateChannel)
            {
               let fid;
               channel.id.split('/').map(id=>{ 
                  if(id!=this.state.user.uid)
                  {
                    fid = id;
                    return id;
                  } 
                })
              getMessagesRef().child(channel.id).child(key).child('status').child(fid).set(0)
              firebase.database().ref().child('unread').child(channel.id).child(fid).child(key).set(1).then(()=>{
                setTimeout(()=>{
                  firebase.database().ref().child('unread').child(channel.id).child(fid).child(key).once('value',snap=>{
                    if(snap.val()==1)
                    {
                      firebase.database().ref("users").child(fid).child("fcmtoken").once("value",snap=>{
                        let token = Object.keys(snap.val());
                        // window.JSInterface.consoleLog(token);
                        Notification(this.state.user.displayName,message,token,this.state.user.uid,null,"private",null,channel.id);
                      }); 
                    }
                  });
                },2500); 
              });
            }
            else
            {
              getMessagesRef().child(channel.id).child(key).child('seenBy').child(user.uid).set(1).then(()=>
              {
                setTimeout(()=>{
                    getMessagesRef().child(channel.id).child(key).child('seenBy').once("value",snap=>{  
                      Notification(this.state.user.displayName,message,channel.id,user.uid, Object.keys(snap.val()),"channel",channel.name,channel.id);
                    });
                },2500)
               
                
              });

            } 
         })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
        this.setState({ loading: false, message: "", errors: [] });
    } 
    else
    {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a Message" })
      });
    }
    this.messageInputRef.focus(); 
  };

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private/${this.state.channel.id}`;
    } else {
      return "chat/public";
    }
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };


    addFile = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      }
      try {
        const compressedFile =   await imageCompression(file, options);
        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
        console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
        await this.sendFile(compressedFile); 
      } catch (error) {
        console.log(error);
      }
    }
  };

  sendFile = (file) => { 
    if (file !== null) {
      if (this.isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        this.uploadFile(file, metadata);
        // this.closeModal();
       
      }
    }
  };

  isAuthorized = filename =>
    this.state.authorized.includes(mime.lookup(filename)); 

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    const{channel}=this.state;
    let key = ref
      .child(pathToUpload)
      .push().key
      ref.child(pathToUpload).child(key)
      .update(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
        if(this.props.isPrivateChannel)
        { 
            let fid;
            channel.id.split('/').map(id=>{ 
              if(id!=this.state.user.uid)
              { 
                fid = id;
                return id;
              }
            })
          ref.child(channel.id).child(key).child('status').child(fid).set(0)
          firebase.database().ref().child('unread').child(channel.id).child(fid).child(key).set(1).then(()=>{
            setTimeout(()=>{
              firebase.database().ref().child('unread').child(channel.id).child(fid).child(key).once('value',snap=>{
                if(snap.val()==1)
                {
                  firebase.database.ref("users").child(fid).child("fcmtoken").once("value",snap=>{
                    Notification(this.state.user.displayName,"Sent You A Photo",snap.val(),this.state.user.uid,null,"private",null,channel.id);
                  });
                }
              });
            },2500); 
          });
        }
        else
        {
          ref.child(channel.id).child(key).child('seenBy').child(this.state.user.uid).set(1).then(()=>
          {
            setTimeout(()=>{
                ref.child(channel.id).child(key).child('seenBy').once("value",snap=>{ 
                  
                  Notification(this.state.user.displayName,"Sent A Photo",channel.id,this.state.user.uid, Object.keys(snap.val()),"channel",channel.name,channel.id);
                });
            },2500)      
          });

        }
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };
  resetReplyState =()=>{
    this.props.setReplyBox(false)
    this.props.setReplyImage(false)
  }

  handleTouchStart=(e)=>{ 
    this.props.toggelSideBar(false);
  }
    handleTouchEnd = ()=>{   
  }
  
    handleTouchMove = (e)=>{   
      // this.props.toggelSideBar() 
      if((this.rightSideRef.offsetLeft-e.touches[0].clientX)>100)
      {
        this.props.toggelSideBar(true)
      } 
  }

  render() {
    // prettier-ignore
    const { errors, message, loading, uploadState, percentUploaded, emojiPicker} = this.state;

    return (
      <div>
        {emojiPicker && (
          <Picker
            set="apple"
            onSelect={this.handleAddEmoji}
            className="emojipicker"
            title="Pick your emoji"
            emoji="point_up"
          />
        )}
        <Grid className="message__form"
            onTouchStart={touchStartEvent => this.handleTouchStart(touchStartEvent)}
            onTouchMove={touchMoveEvent => this.handleTouchMove(touchMoveEvent)}
            onTouchEnd={() => this.handleTouchEnd()}> 
          {this.props.replyBox?(
            <Grid.Row className="toberepliedRow">
              <div>
                  {this.props.isReplyImage?(
                    <Image src={this.props.replyText} className="toBeRepliedImage"/> 
                  ):( 
                    this.props.replyText 
                  )}
              </div>
              <div style={{position:'absolute',right:10}}>
                <Icon name="close" onClick={()=>this.resetReplyState()} />
              </div>
                
            </Grid.Row>
            ):(null)} 
          <Grid.Row  className="message__formRow"> 
              <Input 
                name="message"
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                value={message}
                onClick={this.props.scrollFunction}
                ref={node => (this.messageInputRef = node)}
                style={{ marginBottom: "0.7em",flex:1 }}
                label={
                  <Button
                  disabled={uploadState === "uploading"}
                  onClick={this.openModal} 
                  icon="attach" />
                }
                labelPosition="left"
                className={
                  errors.some(error => error.message.includes("message"))
                    ? "error"
                    : ""
                }
                placeholder="Write your message"
              /> 
               
                <div
                className="sendMessageButton"
                onClick={this.sendMessage}
                disabled={loading}>
                  <Icon name="send" style={{marginTop:7}}/> 
               </div> 
               <div ref={node=>{this.rightSideRef=node}}/>
               {/* <Icon
                  name="attach" 
                  icon={emojiPicker ? "close" : "add"}
                    content={emojiPicker ? "Close" : null}
                    onClick={this.handleTogglePicker}
                  style={{position: 'relative',
                  top: '30%',
                  right: '20%'}}
                  />     */}
          </Grid.Row> 
        </Grid> 
        <input
            onChange={this.addFile}
            fluid="true"
            ref={node => (this.fileInputRef = node)}
            label="File types: jpg, png"
            name="file"
            style={{display:'none'}}
            type="file"
          />
        {/* <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        /> */}
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </div>
      );
  }
}
const mapStateToProps = state => ({ 
  replyBox:state.message.replyBox,
  replyText:state.message.replyText,
  isReplyImage:state.message.isReplyImage,
});
export default connect(mapStateToProps,{setReplyBox,setReplyImage,toggelSideBar})(MessageForm);
