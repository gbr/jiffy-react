import React, { Component } from 'react';
import loader from './images/loader.svg';
import clearButton from './images/close-icon.svg';
import Gif from './Gif';

const API = 'uJCFMRMbCCS7PAFNGJ6nBWi4wx1IVcBj';

const Header = ({ clearSearch, hasResults }) => (
  <div className="header grid">
    {hasResults ?
      <button onClick={clearSearch}><img alt="" src={clearButton} /></button> :
      <h1 className="title">Jiffy</h1>}
  </div>
)

const UserHint = ({ loading, hintText }) => (
  <div className="user-hint">{loading ?
    <img src={loader} alt="" className="block mx-auto" /> :
    hintText
  }</div>
)

const randomChoice = (arr) => (
  arr[Math.floor(Math.random() * arr.length)]
)

class App extends Component {
  // create-react-app allows us to write component methods as arrow
  // functions, so we don't need constructors or bind

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      hintText: 'Hit Enter to search',
      gifs: []
    }
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

      if (!data.length) {
        throw new Error(`Nothing found for ${searchTerm}`);
      }

      const randomGif = randomChoice(data);

      this.setState((prevState, props) => ({
        ...prevState,
        gifs: [...prevState.gifs, randomGif],
        loading: false,
        hintText: `Hit Enter to see more ${searchTerm}`
      }));

    } catch (error) {
      this.setState((prevState, props) => ({
        ...prevState,
        hintText: error.toString(),
        loading: false
      }))
    }
  }

  handleChange = event => {
    const { value } = event.target;
    this.setState((prevState, props) => ({
      // take old props and spread them out here
      ...prevState,
      // then update with newest search term
      searchTerm: value,
      hintText: value.length > 2 ? `Hit Enter to search ${value}` : ''
    }))

  }

  handleKeyPress = event => {
    const { value } = event.target;
    if (value.length > 2 && event.key === 'Enter') {
      this.searchGiphy(value);
    }
  }

  clearSearch = () => {
    this.setState((prevState, props) => ({
      ...prevState,
      searchTerm: '',
      hintText: '',
      gifs: []
    }));
    // note: this is using the ref input defined in the original input element
    this.textInput.focus();
  }


  render() {
    const { searchTerm, gifs } = this.state;
    const hasResults = gifs.length > 0;
    return (
      <div className="page">
        <Header clearSearch={this.clearSearch} hasResults={hasResults} />

        <div className="search grid">
          {this.state.gifs.map(
            (gif, idx) =>
              <Gif {...gif} key={idx} />
          )}
          <input type="text" className="input" placeholder="Type something"
            onChange={this.handleChange} onKeyPress={this.handleKeyPress}
            value={searchTerm} ref={input => { this.textInput = input; }} />
        </div>

        {/* Pass our userHint all of our state using a spread */}
        <UserHint {...this.state} />
      </div>
    )
  }
}

export default App;