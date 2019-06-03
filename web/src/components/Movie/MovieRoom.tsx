
import * as React from 'react';
const {useEffect, useState, useRef} = React;
import Form from'./Form';
import Chatbar from './Chatbar'
import "./movie.scss";
import Playlist from './Playlist';
import Errorpage from './Errorpage';
import ReactPlayer from 'react-player';
import Cookies from 'universal-cookie';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
const mainbg = require('./img/main.png');


let playedFraction: number;
let duration: number;

const MovieRoom = (props) => {
  const socket = props.socket;

  const roomId = props.match.params.id;

  const [currentPlaying, setCurrentPlaying] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoom, setIsRoom] = useState(false);
  const [username, setUsername] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [turnArrow, setTurnArrow] = useState("fas fa-3x fa-chevron-up down");

  const [clientCount, setClientCount] = useState();
  
  const userObj = {
    socket,
    isAdmin
  }

  const ref = player => {
    this.player = player
  }

  const handleClick = () => {
    socket.emit('get number of clients', roomId)
  }

  const onPlay = () => {
    setTimeout(() => {
      let timestamp = Math.floor(playedFraction * duration)
      socket.emit('share video timestamp', timestamp+1)
    },1000)
  
  }

  const onEnded = () => {
    socket.emit('done playing', roomId);
  }

  const addToPlaylist = (videoData, id) => {
    videoData.socketId = socket.id;
    videoData.id = id;
    setPlaylist([...playlist, videoData]);
    setTurnArrow("fas fa-3x fa-chevron-up up")
    setIsHidden(true);
  }
  
  const sendMessage = (data, id, index) => {
    let message = {
      socketId: socket.id,
      roomId,
      ...data,
      id,
      i: index
    }
    console.log(message);
    socket.emit('add to playlist', message)
  }

  const playVideo = (videoData, videoId) => {
    if (isAdmin) {
      setCurrentPlaying(videoId);
      const videoObj = {
        socketId: socket.id,
        videoData,
        videoId,
        roomId
      }
      socket.emit("play video", videoObj)
    }
  }

  const deleteVideo = (video, id) => {
    console.log('yes');
    const videoObj = {
      video,
      id
    }
    socket.emit("delete from playlist", videoObj);
  }

  
  useEffect(() => {
    

    axios.post(process.env.URL + `/api/getRoom`, {
      params: roomId
    })
    .then(response => {
      console.log(response.data.response)
      if (response.data.response === true) {
        // setTimeout(() => {
          setIsLoading(false);

        // }, 3000)
        setIsRoom(true);
        setUsername(response.data.username);
        setPlaylist(response.data.playlist);
        setCurrentPlaying(response.data.currentVideo);
      } else {
        // setTimeout(() => {
          setIsLoading(false);

        // }, 3000)
      }
    })

    const cookies = new Cookies();
    const roomIdCookie = cookies.get('roomId');
    const adminIdCookie = cookies.get('adminId');

    const roomObject = {
      roomId,
      roomIdCookie,
      adminIdCookie
    }

    socket.emit('joinRoom', roomObject)
    
    socket.on('admin timestamp', (data) => {
      let timestamp = Math.floor(playedFraction * duration)
      socket.emit('give admin timestamp', timestamp + 3);
    })

    socket.on('is admin', (adminInfo) => {
      setIsAdmin(true);
    })

    socket.on('sync playlist', (data) => {
      setPlaylist(data);
      setTurnArrow("fas fa-3x fa-chevron-up up");     
      setIsHidden(true);
    })

    socket.on('sync video timestamp', (timestamp: number) => {
      this.player.seekTo(timestamp);
    })

    socket.on('play video', (videoId) => {
      
      setCurrentPlaying(videoId);
      
    })

    socket.on('play next video', (videoId) => {
      console.log(videoId)
      setCurrentPlaying(videoId)
    })

    socket.emit("get number of clients", (roomId))

    socket.on("send number of clients", (data) => {
      
      console.log("numClients", data.numClients)
      if (roomId === data.roomId) {
        setClientCount(data.numClients);
      }
    })
  }, [])


  const renderPage = () => {
    if(!isLoading && isRoom) {
      return (
        
            <div className="movie-contains-all">
            <header className="Header">
    
            <Form
              addToPlaylist={addToPlaylist}
              sendMessage={sendMessage}
              playVideo={playVideo}
            />
            
             <div id="navigation" className="Navigation">
             
             <h6 id="admin-notice">{ isAdmin ? 'You Are Admin' : ''}</h6>
             
             
             
            <nav>
              
              <ul>
             
                <li>
                <Link to="/publicroom" style={{ textDecoration: 'none', color: 'white' }}>Browse</Link>
                </li>
                <li>
                  
                </li>
                <li></li>
                <li>
                <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>Home</Link>
                </li>
                <li></li>
                <li>

                 </li>
                <li>
                <CopyToClipboard 
                  text={process.env.REACT_URL + '/movie/' + roomId}
                  onCopy={() => alert("Copied to clipboard")}>
                  <Link className="share-link" style={{ textDecoration: 'none', color: 'white' }}>Share</Link>
                </CopyToClipboard>
                </li>
                
                
              

               
              </ul>
            </nav>
          </div>
             
            </header>
          
          <div
            id="hero"
            className="Hero re-size"
          >
            <div>
            
            </div>
          <div className="content">
         
          <div id="player-box">
          
          <ReactPlayer 
            className="move-player"
            ref={ref}
            url={`https://www.youtube.com/watch?v=${currentPlaying}`}
            playing={true}
            height={'420px'}
            controls={true}
            volume={0}
            muted={true}
            onProgress={(state) => playedFraction = state.played}
            onDuration={(totaltime) => duration = totaltime}
            onPlay={onPlay}
            onEnded={onEnded}
          /> 
          <h6 className="move-watching" style={{ textDecoration: 'none', color: 'white' }}>{ clientCount } watching now</h6>
          
               
            
          
           
          </div>
        
          <Chatbar
            username={username}
            socket={socket}
            roomId={roomId}/>
          
          </div>
         
          <div className="overlay" /></div>
          <footer className="pin-bottom">

          <Playlist 
            playlist={playlist} 
            playVideo={playVideo}
            deleteVideo={deleteVideo}
            admin={userObj}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
            turnArrow={turnArrow}
            setTurnArrow={setTurnArrow}
          />
            </footer>
          
              {/* testing purposes */}
          </div>
      )
    } else if(!isLoading && !isRoom) {
      return <Errorpage />
      
      
      // return <div className="alert alert-danger" role="alert">Unable to find page</div>
    } else if(isLoading) {
      return <img id="loading-image" src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/28963/giphy%20(24).gif' alt="Loading..."/>
    }

  }

  return (
    
    <>
      {renderPage()}
    </>
  )
  
}
              
                
    
    

export default MovieRoom;

