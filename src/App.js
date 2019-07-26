import React, { Component } from "react";
import loader from "./images/loader.svg";
import clearButton from "./images/close-icon.svg";
import Gif from "./Gif";

const API = "uJCFMRMbCCS7PAFNGJ6nBWi4wx1IVcBj";

/* 
  TODO optimize the mobile experience by:
  - implementing more tap-friendly interface (search suggestions, etc.)
  - eventually implement a react native interface
*/

/*
  TODO improve the visuals by bringing the app closer to the original designs by:
  - Pin blue rectangle with clickable GIF source URL
  - Implement image fullscreen if click outside the source URL (basically replace mobile target for new result)
 */

//  TODO clear tangled state bewteen isMobile, isDirty, and hintText—can derive from each other

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

const UserHint = ({ loading, hintText, onTouchStart, onTouchEnd }) => (
  <div className="user-hint">
    {loading ? (
      <img src={loader} alt="" className="block mx-auto" />
    ) : (
      <span onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {hintText}
      </span>
    )}
  </div>
);

const randomChoice = arr => {
  const randIdx = Math.floor(Math.random() * arr.length);
  const randEl = arr[randIdx];
  arr.splice(randIdx, 1);
  return randEl;
};

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

  stackNewGif = async searchTerm => {
    const { isDirty, isMobile } = this.state;
    let { cache } = this.state;

    if (isDirty || !cache.length) {
      this.setState(prevState => ({
        loading: true,
        gifs: cache && cache.length ? prevState.gifs : []
      }));

      try {
        const limit = isMobile ? 5 : 15;
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${API}&q=${searchTerm}&limit=${limit}&offset=0&rating=G&lang=en`
        );
        const { data } = await response.json();

        if (!data.length) {
          throw new Error(`Nothing found for ${searchTerm}`);
        }

        cache = data.map(result => result.images.original.mp4);
        this.setState({ cache, isDirty: false });
      } catch (error) {
        this.setState({
          hintText: error.toString()
        });
      } finally {
        this.setState({ loading: false });
      }
    }
    const randomGif = randomChoice(cache);

    this.setState(prevState => ({
      ...prevState,
      gifs: [...prevState.gifs, randomGif],
      hintText: isMobile
        ? `Tap here to see more ${searchTerm}`
        : `Hit Enter to see more ${searchTerm}`
    }));
  };

  handleChange = event => {
    const { value } = event.target;
    const { isMobile } = this.state;
    this.setState({
      isDirty: true,
      searchTerm: value,
      hintText:
        value.length > 2
          ? isMobile
            ? `Tap here to see more ${value}`
            : `Hit Enter to search ${value}`
          : ""
    });
  };

  handleKeyPress = event => {
    const { value } = event.target;
    if (value.length > 2 && event.key === "Enter") {
      this.stackNewGif(value);
    }
  };

  handleWindowResize = () => {
    this.setState({
      isMobile:
        /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 480
    });
  };

  handleClickEvent = event => {
    event.preventDefault();
  };

  handleTouchEnd = event => {
    event.preventDefault();
  };

  handleTouchStart = event => {
    event.preventDefault();
    const { searchTerm } = this.state;
    if (searchTerm.length > 2) {
      this.stackNewGif(searchTerm);
    }
  };

  clearSearch = () => {
    this.setState({
      searchTerm: "",
      hintText: "",
      gifs: []
    });
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
              <Gif alt={searchTerm} videoSrc={gif} key={idx} />
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

        <UserHint
          hintText={this.state.hintText}
          loading={this.state.loading || false}
          onTouchStart={this.handleTouchStart}
          onTouchEnd={this.handleTouchEnd}
        />
      </div>
    );
  }
}

export default App;
