
import * as React from 'react';
const { useState, useEffect } = React;
import { Link } from 'react-router-dom';
import Home from '../../interfaces/Home.interface';
import {useAudio} from '../../hooks/audio'
import axios from 'axios';
import {getCircularReplacer} from '../helpers/helper';
import Cookies from 'universal-cookie';
const soundFile = require('../../assets/movie.mp3');
import "./home.scss";

const openInNewTab = (url) => {
  var win = window.open(url, '_blank');
  win.focus();
}

const Movie: React.FunctionComponent<Home> = props => { 
  const socket = props.socket;

    const handleClick = (type) => {
      
      axios.post(process.env.URL + `/api/createRoom`, {
        socket: JSON.stringify(socket, getCircularReplacer()),
        type
      })
      .then(response => {
        openInNewTab(`/movie/${response.data.url}`)
        // window.location.replace(`/movie/${response.data.url}`);
        const cookies = new Cookies();
        cookies.set('adminId', socket.id, { path: '/' });
        cookies.set('roomId', response.data.url, {path: '/' });
      })
    }


  return ( 
      <>
   
   
     
        <section>
     
        <div className="containerh">
      
      
          <div className="background-imgh">
          <div className = "public-room-spacing">
        {/* <Link className="nav-hover-on public-room-home " to="/publicroom" style={{ textDecoration: "none", color: "white" }}> */}
       {/* <button className="button btn-grad-public  ">Join Public Rooms</button>  */}
       <a href="/publicroom" style={{color:'white'}} className=" button btn-grad-public bttn-public"><h3 style={{fontWeight:'bold'}}>Join Public Rooms</h3></a>
      {/* </Link> */}
      </div>
            <div className="boxh">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <div className="contenth pointer" >
                <h2>Cheetah </h2>
                <p><a  style={{color:'#00ffe9'}} target="_blank">Welcome to Cheetah a fast way to sync and watch videos with others. Click here to create a room</a></p>
                <div className="btn-spacing">

                <button className="button btn-grad " style={{color:'white'}} onClick={()=> handleClick("public")}><p style={{color:'white', fontWeight:'bold'}}>Create Public Room</p></button>

                </div>
                <div className="btn-spacing">

                <button className="button btn-grad" style={{color:'white'}} onClick={()=> handleClick("private")}><p  style={{color:'white', fontWeight:'bold'}}>Create Private Room</p></button>
                </div>
              
              </div>
              
            </div>
 
          </div> 
        </div>
        </section>
      </>
    );
}
 
export default Movie;