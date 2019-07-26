import React, { Component } from "react";
import loader from "./images/loader.svg";
import clearButton from "./images/close-icon.svg";
import Gif from "./Gif";

const API = "uJCFMRMbCCS7PAFNGJ6nBWi4wx1IVcBj";

/* 
  TODO optimize the mobile experience by:
  - making sure input control are easily accessible via thumb
  - removing old GIFs buried deep down in the DOM that you can't see anyway
  - implementing more tap-friendly interface (tap to keep searching, search suggestions, clear search on the right, etc.)
  - eventually implement a react native interface
*/

/*
  TODO improve the visuals by bringing the app closer to the original designs by:
  - Pin blue rectangle with clickable GIF source URL
  - Implement image fullscreen if click outside the source URL (basically replace mobile target for new result)
 */

const Header = ({ clearSearch, hasResults, isMobile }) => (
  <div className="header grid">
    {!isMobile && hasResults ? (
      <button onClick={clearSearch}>
        <img alt="" src={clearButton} />
      </button>
    ) : (
      <h1 className="title">Jiffy</h1>
    )}
  </div>
);

const UserHint = ({ loading, hintText }) => (
  <div className="user-hint">
    {loading ? <img src={loader} alt="" className="block mx-auto" /> : hintText}
  </div>
);

const randomChoice = arr => arr[Math.floor(Math.random() * arr.length)];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      hintText: "",
      gifs: [] // TODO rename all mention of gif to srcUrl or something
    };
  }

  componentDidMount() {
    this.handleWindowResize();
    window.addEventListener("resize", this.handleWindowResize);
  }

  searchGiphy = async searchTerm => {
    this.setState(() => ({
      loading: true
    }));

    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${API}&q=${searchTerm}&limit=25&offset=0&rating=G&lang=en`
      );
      const { data } = await response.json();

      // TODO create caching mechanism to assume user will keep entering the same search term

      if (!data.length) {
        throw new Error(`Nothing found for ${searchTerm}`);
      }

      const randomGif = randomChoice(data);

      this.setState(prevState => ({
        ...prevState,
        gifs: [...prevState.gifs, randomGif],
        loading: false,
        hintText: this.state.isMobile
          ? `Keep tapping to see more ${searchTerm}`
          : `Hit Enter to see more ${searchTerm}`
      }));
    } catch (error) {
      this.setState(prevState => ({
        ...prevState,
        hintText: error.toString(),
        loading: false
      }));
    }
  };

  handleChange = event => {
    const { value } = event.target;
    this.setState(prevState => ({
      ...prevState,
      searchTerm: value,
      hintText: value.length > 2 ? `Hit Enter to search ${value}` : ""
    }));
  };

  handleKeyPress = event => {
    const { value } = event.target;
    if (value.length > 2 && event.key === "Enter") {
      this.searchGiphy(value);
    }
  };

  handleWindowResize = () => {
    this.setState({
      isMobile:
        /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 480
    });
  };

  handleTouchStart = () => {
    console.log("touchStart");
    const { searchTerm } = this.state;
    if (searchTerm.length > 2) {
      this.searchGiphy(searchTerm);
    }
  };

  clearSearch = () => {
    this.setState(prevState => ({
      ...prevState,
      searchTerm: "",
      hintText: "",
      gifs: []
    }));
    // note: this is using the ref input defined in the original input element
    // this is one of the few good times to use a ref
    this.textInput.focus();
  };

  render() {
    const { searchTerm, gifs, isMobile } = this.state;
    const hasResults = gifs.length > 0;

    return (
      <div className="page">
        {/* <div className="mobile-cols"> */}
        <Header
          clearSearch={this.clearSearch}
          hasResults={hasResults}
          isMobile={isMobile}
        />

        <div className="mobile-grid">
          <div className="search grid ">
            {/* TODO add additional div with button here if it is mobile */}
            {this.state.gifs.map((gif, idx) => (
              <Gif
                onTouchStart={this.handleTouchStart}
                videoSrc={gif.images.original.mp4}
                key={idx}
              />
            ))}
            {hasResults && isMobile ? (
              <button onClick={this.clearSearch}>
                <img alt="" src={clearButton} />
              </button>
            ) : null}
          </div>

          <input
            type="text"
            className="input"
            placeholder="Type something"
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
            value={searchTerm}
            // note: this ref is here for focus manipulation purposes only
            ref={input => {
              this.textInput = input;
            }}
          />
        </div>
        {/* </div> */}

        <UserHint
          hintText={this.state.hintText}
          loading={this.state.loading || false}
        />
      </div>
    );
  }
}

export default App;
