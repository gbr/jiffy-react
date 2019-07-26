import React, { useState } from "react";
import PropTypes from "prop-types";

const Gif = ({ videoSrc, onTouchStart }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <video
      className={`grid-item video ${loaded && "loaded"}`}
      autoPlay
      loop
      src={videoSrc}
      onLoadedData={() => setLoaded(true)}
      onTouchStart={onTouchStart}
    />
  );
};

Gif.propTypes = {
  videoSrc: PropTypes.string
};

export default Gif;
