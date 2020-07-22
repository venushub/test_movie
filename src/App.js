import React, { useState, useEffect, useRef } from "react";
import MovieDetail from "./MovieDetail";
import moviesList from "./imdb.json";
import { useInView } from "react-intersection-observer";
import "./styles.css";

export default function App() {
  const [movies, setMovies] = useState(moviesList);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [search, setSearch] = useState("");
  const [genreList, setGenreList] = useState({});
  const [sort, setSort] = useState("imdb_score_high_to_low");
  const [num, setNum] = useState(10);
  let appref = useRef(null);

  useEffect(() => {
    let genre = {};
    moviesList.forEach(ml => {
      ml.genre.forEach(mg => {
        if (!genre[mg]) genre[mg] = false;
      });
    });
    console.log(genre);
    setGenreList(genre);
  }, []);

  const handleLoadMore = () => {
    setNum(num + 10);
  };

  const handleSearch = val => {
    setSearch(val);
  };

  const clearSearch = () => {
    setSearch("");
  };

  useEffect(() => {
    let mvs = moviesList.concat([]);

    if (search !== "") {
      mvs = mvs.filter(mv =>
        mv.name
          .concat(mv.director)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    let filters = [];
    Object.keys(genreList).forEach(gli => {
      if (genreList[gli] === true) filters.push(gli);
    });
    if (filters.length > 0) {
      mvs = mvs.filter(mv => {
        let common = filters.some(item => mv.genre.includes(item));
        console.log(common);
        if (common) {
          return true;
        } else {
          return false;
        }
      });
    }

    switch (sort) {
      case "imdb_score_high_to_low":
        mvs.sort((a, b) => b["imdb_score"] - a["imdb_score"]);
        break;
      case "imdb_score_low_to_high":
        mvs.sort((a, b) => a["imdb_score"] - b["imdb_score"]);
        break;
      case "99popularity_high_to_low":
        mvs.sort((a, b) => b["99popularity"] - a["99popularity"]);
        break;
      case "99popularity_low_to_high":
        mvs.sort((a, b) => a["99popularity"] - b["99popularity"]);
        break;
      default:
        console.log("hey");
    }

    setMovies(mvs);
    setNum(10);
  }, [search, genreList, sort]);

  useEffect(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [displaySettings]);

  const clearFilters = () => {
    setSearch("");

    let temp = {};
    for (let i in genreList) {
      temp[i] = false;
    }
    setGenreList(temp);
    setSort("imdb_score_high_to_low");
  };

  return (
    <div ref={appref} className="App">
      <Header
        onSettingsClick={() => {
          setDisplaySettings(!displaySettings);
        }}
      />

      <Movies movies={movies.slice(0, num)} handleLoadMore={handleLoadMore} />
      {displaySettings ? (
        <Settings
          genreList={genreList}
          sort={sort}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
          clearFilters={clearFilters}
          handleSorting={val => setSort(val)}
          onGenreListChange={newGenreList => {
            console.log(newGenreList);
            setGenreList(newGenreList);
          }}
        />
      ) : null}
    </div>
  );
}

const Settings = props => {
  return (
    <div className="settings">
      <Search
        handleSearch={props.handleSearch}
        clearSearch={props.clearSearch}
      />
      <Filters {...props} />
      <Sorting sort={props.sort} handleSorting={props.handleSorting} />
      <button className="clear-filters-button" onClick={props.clearFilters}>
        Clear Filters
      </button>
    </div>
  );
};

const Sorting = ({ sort, handleSorting }) => {
  return (
    <div className="sort-div">
      <h3 style={{ marginRight: "auto" }} className="set-title">
        Sort By
      </h3>
      <select
        className="my-select"
        default="imdb_score_high_to_low"
        value={sort}
        onChange={e => handleSorting(e.target.value)}
      >
        <option value="imdb_score_high_to_low">Imdb Score High to Low</option>
        <option value="imdb_score_low_to_high">Imdb Score Low to High</option>
        <option value="99popularity_high_to_low">Popularity High to Low</option>
        <option value="99popularity_low_to_high">Popularity Low to High</option>
      </select>
    </div>
  );
};

const Search = props => {
  const [searchVal, setSearchVal] = useState("");
  const [myto, setMyto] = useState();

  const debounceFire = val => {
    console.log("heyy");
    if (myto) {
      clearTimeout(myto);
    }
    setMyto(
      setTimeout(() => {
        props.handleSearch(val);
      }, 2000)
    );
  };

  return (
    <div className="my-input-box">
      <input
        className="my-input"
        placeholder="search any thing"
        type="text"
        value={searchVal}
        onChange={e => {
          setSearchVal(e.target.value);
          debounceFire(e.target.value);
        }}
      />
      <i
        onClick={() => {
          if (searchVal !== "") {
            props.clearSearch();
            setSearchVal("");
          }
        }}
        className="my-icon icon-large material-icons cbn"
      >
        {searchVal === "" ? "search" : "close"}
      </i>
    </div>
  );
};

const Filters = props => {
  return (
    <div className="genre-div">
      <div className="df ac jsp mg1">
        <h3 className="set-title">Genre</h3>
        <button
          onClick={() => {
            let obj = {};
            for (let x in props.genreList) {
              obj[x] = false;
            }
            props.onGenreListChange(obj);
          }}
          className="cfs"
        >
          clear
        </button>
      </div>

      <div className="genre-con">
        {Object.keys(props.genreList)
          .sort((a, b) => {
            return props.genreList[a] ? -1 : 1;
          })
          .map((genre, index) => {
            return <Genre key={index} genre={genre} {...props} />;
          })}
      </div>
    </div>
  );
};

const Genre = ({ genre, genreList, onGenreListChange }) => {
  return (
    <div
      onClick={() => {
        onGenreListChange({ ...genreList, [genre]: !genreList[genre] });
      }}
      className={genreList[genre] ? "genre genre-selected" : "genre"}
    >
      {genre}
    </div>
  );
};

const Header = ({ onSettingsClick }) => {
  return (
    <div className="header">
      <h1 className="header-title">EivoM</h1>
      <button onClick={onSettingsClick} className="my-button filter-button">
        <i className="my-icon icon-large material-icons">filter_list</i>
      </button>
    </div>
  );
};

const Movies = ({ movies, handleLoadMore }) => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedMovie, setSelectedMovie] = useState(null);
  const [ref, inView, entry] = useInView({
    threshold: 0
  });

  useEffect(() => {
    console.log("hey", inView);
    if (inView) {
      handleLoadMore();
    }
  }, [inView]);

  return (
    <div className="movies-con">
      {movies.map(movie => {
        return (
          <Movie
            // onClick={() => {
            //   setSelectedMovie(movie);
            //   setIsModalOpen(true);
            // }}
            movie={movie}
          />
        );
      })}
      <div ref={ref} />
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMovie(null);
        }}
      >
        {selectedMovie ? <MovieDetail movie={selectedMovie} /> : null}
      </Modal> */}
    </div>
  );
};

const Movie = ({ movie, onClick }) => {
  const [showDetails, setShowDetails] = useState(false);
  const movieRef = useRef(null);

  useEffect(() => {
    movieRef.current.addEventListener("blur", () => {
      setShowDetails(false);
    });

    return () => {
      movieRef.current.removeEventListener("blur", () => {}, true);
    };
  }, []);

  useEffect(() => {
    if (showDetails) {
      movieRef.current.focus();
    }
  }, [showDetails]);

  return (
    <div
      onClick={() => {
        setShowDetails(!showDetails);
      }}
      className="movie"
    >
      <div className="movie-name">{movie.name}</div>
      <div className="score">{movie.imdb_score}</div>
      <div
        tabIndex="0"
        ref={movieRef}
        style={{
          top: showDetails ? "0px" : "90%",
          background: showDetails
            ? "linear-gradient(rgb(154, 48, 87), rgb(171, 50, 50))"
            : "none"
        }}
        className="movie-details"
      >
        <div className="movie-details-content">
          {!showDetails ? (
            <i style={{ opacity: "1 !important" }} className="material-icons">
              keyboard_arrow_up
            </i>
          ) : (
            <i style={{ opacity: "1 !important" }} className="material-icons">
              keyboard_arrow_down
            </i>
          )}

          <div
            style={{ opacity: showDetails ? "1" : "0" }}
            className="detail-title"
          >
            Director
          </div>
          <div
            style={{ opacity: showDetails ? "1" : "0" }}
            className="detail-value"
          >
            {movie.director}
          </div>
          <div
            style={{ opacity: showDetails ? "1" : "0" }}
            className="detail-title"
          >
            Popularity
          </div>
          <div
            style={{ opacity: showDetails ? "1" : "0" }}
            className="detail-value"
          >
            {movie["99popularity"]}
          </div>
          <div
            style={{ opacity: showDetails ? "1" : "0" }}
            className="detail-title"
          >
            Genre
          </div>
          <div
            style={{ opacity: showDetails ? "1" : "0" }}
            className="genre-list-con"
          >
            {movie.genre.map(gen => {
              return <div className="genre-chip">#{gen}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// const Modal = ({ isOpen, onClose, children }) => {
//   return isOpen ? (
//     <div className="modal">
//       <div className="modal-body">
//         <div className="modal-head df-ac ">
//           <button onClick={onClose} className="my-button mgl-at">
//             <i className="my-icon icon-large material-icons">close</i>
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   ) : null;
// };
