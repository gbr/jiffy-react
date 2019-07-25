import React, { useState } from "react";
import PropTypes from "prop-types";

const Gif = ({ videoSrc }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <video
      className={`grid-item video ${loaded && "loaded"}`}
      autoPlay
      loop
      src={videoSrc}
      onLoadedData={() => setLoaded(true)}
    />
  );
};

Gif.propTypes = {
  videoSrc: PropTypes.string
};

export default Gif;
