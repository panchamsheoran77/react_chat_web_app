import { combineReducers } from "redux";
import * as actionTypes from "../actions/types";

const initialUserState = {
  currentUser: null,
  isLoading: true
};

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null,
  visible:false,
  numUniqueUsers:0,
  previousChannelListeners:[],
  urlChannelId:null,
};

const channel_reducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel,
       
      };
    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel,
       
      };
    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts,
        
      };
      case actionTypes.SET_SIDE_BAR:
        return{
          ...state,
          visible:action.payload.visible
        }
        case actionTypes.SET_CHANNEL_USERS:
          return{
            ...state,
            numUniqueUsers:action.payload.count
          }
          case actionTypes.SET_PREVIOUS_CHANNEL_LISTENERS:
          return{
            ...state,
            previousChannelListeners:state.previousChannelListeners.concat(action.payload.previousChannelListeners)
          }
          case actionTypes.REMOVE_PREVIOUS_CHANNEL_LISTENERS:
          return{
            ...state,
            previousChannelListeners:[]
          }
          case actionTypes.SET_URL_CHANNEL_ID:
          return{
            ...state,
            urlChannelId:action.payload.channelId
          }
    default:
      return state;
  }
};

const initialColorsState = {
  primaryColor: "#4c3c4c",
  secondaryColor: "#eee"
};

const colors_reducer = (state = initialColorsState, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor
      };
    default:
      return state;
  }
};

const initialMetaState={
  isMetaVisible:false,
  isBlocked:false
}
const meta_reducer = (state = initialMetaState, action) => {
  switch (action.type) {
    case actionTypes.SET_META_DISPALY:
      return {
        ...state,
        isMetaVisible: action.payload.isMetaVisible, 
      };
      case actionTypes.SET_USER_BLOCK_STATUS:
      return {
        ...state,
        isBlocked: action.payload.isBlocked, 
      };
    default:
      return state;
  }
};
const initialMessageState={
  replyBox:false,
  replyText:"",
  isReplyImage:false,
  isMsgInfoVisible:false,
  msgRef:""
}
const message_reducer = (state = initialMessageState, action) => {
  switch (action.type) {
    case actionTypes.SET_REPLY_BOX:
      return {
        ...state,
        replyBox: action.payload.replyBox, 
      };
      case actionTypes.SET_REPLY_MSG:
      return {
        ...state,
        replyText: action.payload.replyText, 
      }; 
      case actionTypes.SET_REPLY_IMAGE:
      return {
        ...state,
        isReplyImage: action.payload.isReplyImage, 
      }; 
      case actionTypes.SET_MESSAGE_INFO_VISIBLE:
        return{
          ...state,
          isMsgInfoVisible:action.payload.isVisible
        }
      case actionTypes.SET_MESSAGE_REF:
      return{
        ...state,
        msgRef:action.payload.msgRef
      }
    default:
      return state;
  }
};
const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer,
  colors: colors_reducer,
  meta:meta_reducer,
  message:message_reducer
});

export default rootReducer;
