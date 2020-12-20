import React from 'react';
import firebase from "../../firebase";
import { setMessageInfoVisible,setMessageRef} from "../../actions";
import { connect } from "react-redux";
import { Icon, Image, List, Segment } from 'semantic-ui-react';
class MessageInfo extends React.Component {

    state = {seenUsers:[]}
    componentWillMount() 
    {
        this.seenUsers(this.props.msgRef)
        console.log("mounted");
    }
    seenUsers=(msgRef)=>{
        let user_id;
        let seen_users=[];
        let userDetail;
        msgRef.child('seenBy').on("child_added",snap=>{
            user_id=snap.key;
            firebase.database().ref('users').child(user_id).once("value",userInfo=>{
                // console.log(userInfo.val())
                userDetail=userInfo.val();
                if(userDetail)
                seen_users.push({name:userDetail.name,photo:userDetail.avatar,uid:user_id})
                 
                console.log(seen_users)
                this.setState({seenUsers:seen_users})
            });
        })
    }
    closeModal=()=>{
        this.props.setMessageRef("");
        this.props.setMessageInfoVisible(false)
    }
    render() {
        return (
            <Segment>
                <div className="metaclose" style={{float:'right'}}>
                  <Icon name="close" onClick={this.closeModal}/> 
                </div>
                <div className="metaChannelDesContainer">  
                    <div className="metaSubHeading">Seen By</div>  
                    <div  className="metaChannelUsers">
                        <List className="seenUsersContainer">{this.state.seenUsers.map(user=>(
                            <List.Item key={user.uid}>
                            <Image avatar src={user.photo} /> 
                            <List.Content  className="seenUsersName">
                                <List.Header as="a">{user.name}</List.Header> 
                            </List.Content>
                            </List.Item>
                        ))}</List>
                    </div> 
                </div> 
            </Segment>
            
        );
    }
}

export default connect(null,{setMessageInfoVisible,setMessageRef})(MessageInfo);