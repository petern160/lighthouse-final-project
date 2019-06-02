import * as React from "react";
import Video from "./Video";
import { useEffect, useState } from "react";

const Playlist = props => {
  const [isHidden, setIsHidden] = useState(false);
  const [turnArrow, setTurnArrow] = useState("fas fa-3x fa-chevron-up");
  const playlist = props.playlist;
  // let firstPage;
  // let secondPage;
  // if(playlist.length > MAX_PER_LINE) {
  //   firstPage = playlist.slice(0, 5)

  // }

  // useEffect(()=> {
  //   setPlaylistItems(props.playlist)
  // })

  const togglePlaylist = () => {
    (turnArrow === "fas fa-3x fa-chevron-up down") ? setTurnArrow("fas fa-3x fa-chevron-up right") :
    setTurnArrow("fas fa-3x fa-chevron-up down");
    setIsHidden(isHidden => !isHidden);
  };
  
  console.log("DEBUG", playlist)

  const videoList = playlist.map((data, i) => (
    <Video video={data} playVideo={props.playVideo} deleteVideo={props.deleteVideo} key={i + 100} id={i} admin={props.admin}/>
  ));

  return (
    <>
    <div className="toggle-button">
      <span className="icon is-large"><i className={turnArrow} onClick={togglePlaylist}></i></span>
      {/* <label className="slide-btn-alt">
        <input onClick={togglePlaylist} type="checkbox" />
        <span className="slide-btn-content" data-off="Hide" data-on="Show" />
      </label> */}
    </div>
    {isHidden && (
      <>
      {videoList}
      </>
    )}



      {/* <div
        id="carouselExampleIndicators"
        className="carousel slide carousel-fade"
        data-ride="carousel"
        data-interval="false"
        >
        <ol className="carousel-indicators ">
          <li
            data-target="#carouselExampleIndicators"
            data-slide-to="0"
            className="active"
          />
          {/* <li data-target="#carouselExampleIndicators" data-slide-to="1" />
          <li data-target="#carouselExampleIndicators" data-slide-to="2" /> */}
      {/* </ol> */}
      {/* <div className="carousel-inner">
          <div className="carousel-item active"> */}
    </>
  );
};

export default Playlist;
