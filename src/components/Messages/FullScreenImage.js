import React from 'react';
import {Icon, Image } from "semantic-ui-react";
class FullScreenImage extends React.Component { 
    render() {
        return (
            <div style={{textAlign:'right',fontSize:20}}>
                <Icon name="close" onClick={()=>{this.props.hideImageFunction()}} style={{marginBottom:20}}/>
                
                <Image src={this.props.image} className="message__image_full" />
            </div>
            
        );
    }
}

export default FullScreenImage;