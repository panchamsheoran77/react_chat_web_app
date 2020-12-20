import * as actionTypes from "./types";

/* User Actions */
export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  };
};

/* Channel Actions */
export const setCurrentChannel = channel => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel,
      
    }
  };
};
export const SetUrlChannelId = id => { 
  return {
    type: actionTypes.SET_URL_CHANNEL_ID,
    payload: {
      channelId: id,
      
    }
  };
};

export const setPreviousChannelListeners = channelListeners => {

  return {
    type: actionTypes.SET_PREVIOUS_CHANNEL_LISTENERS,
    payload: {
      previousChannelListeners: channelListeners, 
    }
  };
};
export const removePreviousChannelListeners =() => { 
  return {
    type: actionTypes.REMOVE_PREVIOUS_CHANNEL_LISTENERS    
  };
};
export const toggelSideBar = visible => {
  return {
    type: actionTypes.SET_SIDE_BAR,
    payload: {
      visible: visible, 
    }
  };
};
export const setMetaDispaly = visible => {
  return {
    type: actionTypes.SET_META_DISPALY,
    payload: {
      isMetaVisible: visible, 
    }
  };
};
export const setPrivateChannel = isPrivateChannel => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel
    }
  };
};

export const setUserPosts = userPosts => {
  return {
    type: actionTypes.SET_USER_POSTS,
    payload: {
      userPosts
    }
  };
};

export const setChannelUsers= count => {
  return {
    type: actionTypes.SET_CHANNEL_USERS,
    payload: {
      count
    }
  };
};


/* Message Actions */
export const setUserBlockStatus= status => {
  return {
    type: actionTypes.SET_USER_BLOCK_STATUS,
    payload: {
      isBlocked:status
    }
  };
};
export const setReplyBox= status => {
  return {
    type: actionTypes.SET_REPLY_BOX,
    payload: {
      replyBox:status
    }
  };
};

export const setReplyMsg= content => {
  return {
    type: actionTypes.SET_REPLY_MSG,
    payload: {
      replyText:content
    }
  };
};

export const setReplyImage= status => {
  return {
    type: actionTypes.SET_REPLY_IMAGE,
    payload: {
      isReplyImage:status
    }
  };
};
export const setMessageInfoVisible= status => {
  return {
    type: actionTypes.SET_MESSAGE_INFO_VISIBLE,
    payload: {
      isVisible:status
    }
  };
};
export const setMessageRef= ref => {
  return {
    type: actionTypes.SET_MESSAGE_REF,
    payload: {
      msgRef:ref
    }
  };
};

/* Colors Actions */
export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: actionTypes.SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor
    }
  };
};
