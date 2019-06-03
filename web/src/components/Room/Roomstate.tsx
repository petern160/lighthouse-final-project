import * as React from 'react';
import axios from 'axios';
import "./room.scss";
import {useState, useEffect} from 'react';
const loading = require('./img/loading.gif');



const Roomstate = (props) => {
  const [state, setState] = useState();
  const [clientCount, setClientCount] = useState();
  const socket = props.socket;
  const roomId = props.roomId;

  const handleClick = () => {
    window.location.replace(`/movie/${roomId}`);
  }
  
  useEffect(()=> {
    
      
    axios.post(process.env.URL + '/api/fetchState',{
      roomId
    })
    .then(response => {
        console.log("HEYYYYYY", response.data)
        setState(response.data);
    })

    socket.on('update room state', () => {
      console.log("RECEIVED UPDATE ROOM STATE")
      
      axios.post(process.env.URL + '/api/fetchState',{
        roomId
      })
      .then(response => {
          console.log("HEYYYYYY", response.data)
          setState(response.data);
      })
    })
    socket.emit("get number of clients", (roomId))

    socket.on("send number of clients", (data) => {
      
      console.log("numClients", data.numClients)
      if (roomId === data.roomId) {
        setClientCount(data.numClients);
      }
    })

  },[])

  const renderPage = () => {
    return (
      <div className="col-xs-12 col-sm-6 col-md-3 public-box" onClick={handleClick}>
            <div className="box" id="inner-box">
              <h1 className="room-title">{roomId}</h1>
              <img
                className="picture-sizing"
                src={state && state.videoData.thumbnails.high.url || loading}
              />
              {state && <p>Currently Playing... <br/> {state && state.videoData.title}</p>}
            </div>
            <p id="online-people">{clientCount} people watching</p>
      </div>

    )
  }

  return (
    <>
      {(clientCount > 0) ? renderPage() : false} 
    </>
  )
}

export default Roomstate;