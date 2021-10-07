import './App.css';
import React from 'react';
import uniqid from 'uniqid';

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

function App() {
  const audioRefs = React.useRef([]);
  audioRefs.current = [];
  const [isError, setIsError] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('');
  const [word, setWord] = React.useState();

  const handleInputChange = e => {
    setSearchTerm(e.target.value);
  };

  const handleSearchInput = searchTerm => {
    fetch(`${API_BASE}${searchTerm}`)
    .then(res => res.json())
    .then(res => {
      const error = res.message;
      if(error) {
        setIsError(true);
        return;
      }
      else {
        setIsError(false);
      }
      setWord(res[0]);
    })

    setSearchTerm('');
  };

  const handleEnterInput = (e, searchTerm) => {
    if(e.key === 'Enter') {
      handleSearchInput(searchTerm);
    }
  }

  const handlePlayAudio = index => {
    audioRefs.current[index].play();
  };

  const handleRedirect = word => {
    handleSearchInput(word);
  }

  return (
    <div className="App">
      <div className='main'>
        <SearchInput
          searchTerm={searchTerm}
          onInputChange={handleInputChange}
          onSearchInput={handleSearchInput}
          onEnterInput={handleEnterInput}
        />
        {isError && <span className='search__notice'>No exact match found for your search in English. Please Retry!</span>}
        {word && <Main audioRefs={audioRefs} word={word} onPlayAudio={handlePlayAudio} onRedirect={handleRedirect}/>}
      </div>
    </div>
  );
}

function SearchInput({searchTerm, onInputChange, onSearchInput, onEnterInput, error}) {
  return (
    <div className='search'>
      <label className='search__label'>English</label>
      <input className='search__input' onChange={onInputChange} value={searchTerm} onKeyDown={e => onEnterInput(e, searchTerm)} placeholder='Search for your word...'></input>
      <button className='search__button' onClick={() => onSearchInput(searchTerm)}>Search</button>
    </div>
  )
}

function Main({audioRefs, word, onPlayAudio, onRedirect, error}) {
  const meanings = word.meanings;
  const phonetics = word.phonetics;

  return (
    <div className='container'>
      <div className='header'>
        <h1 className='header__h1'>{word.word}</h1>
        {word.origin && <p className='header__p'>{word.origin}</p>}
        {phonetics.map((phonetic, index) => (<div key={uniqid()} className='phonetic'>
          <span className='phonetic__span'>/{phonetic.text}/</span>
          <audio ref={el => audioRefs.current[index] = el} className='audio'>
            <source src={phonetic.audio} type='audio/mpeg'></source>
          </audio>
          <button className='phonetic__button' onClick={() => onPlayAudio(index)}></button>
        </div>))}
      </div>
      <div className='body'>
        {meanings.map((meaning, index) => (
          <div key={uniqid()} className='meaning'>
            <h2 className='meaning__h3'>{word.word} <span className='meaning__span'>{meaning.partOfSpeech}</span></h2>
              {meaning.definitions.map((definition, index) => (
                <div key={uniqid()} className='definitions'>
                  <ul className='definition'>
                    <li className='definition__li'>
                      <span className='li__span'>{`${index+1}. `}{definition.definition}</span><br />
                      {definition.example && <span className='li__span--example'>example: {definition.example}</span>}
                    </li>
                  </ul>
                  <div className='synonyms'>
                    {definition.synonyms.length !== 0 && <h4 className='synonyms__h4'>SYNONYM{' '}</h4>}
                    <ul className='synonym'>{definition.synonyms.map((synonym, index, array) => (
                      <li className='synonym__li' key={uniqid()} onClick={() => onRedirect(synonym)}>{index !== array.length-1 ?
                        (<span><span className='synonym__span'>{synonym}</span><span className='span__colon'>, </span><span/></span>)
                        :
                        (<span className='synonym__span'>{synonym}</span>)
                      }</li>
                    ))}
                    </ul>
                  </div>
                  <div className='antonyms'>
                    {definition.antonyms.length !== 0 && <h4 className='antonyms__h4'>ANTONYM{' '}</h4>}
                    <ul className='antonym'>{definition.antonyms.map((antonym, index, array) => (
                      <li className='antonym__li' key={uniqid()} onClick={() => onRedirect(antonym)}>{index !== array.length-1 ?
                        (<span><span className='antonym__span'>{antonym}</span><span className='span__colon'>, </span><span/></span>)
                        :
                        (<span className='antonym__span'>{antonym}</span>)
                      }</li>
                    ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App;
