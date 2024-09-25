const searchTerm = document.getElementById("movie-search") //search input value
const movieEl = document.getElementById("movie-display") //movie display area
const watchListArea = document.getElementById("watchlist-area") //
const msg = ` <div class="display-area" id="watchlist-area">
              <p class="explore">Your watchlist is looking a little empty...</p>
              <p><a href="index.html"><i class="fa-solid fa-circle-plus"></i></a> Let's add some movies!</p>
              </div>
            `
let imdb = [] //array with the imdb ids to perform second fetch
let displayMovies = [] //full data returned from imdb array

let likedMovies = JSON.parse(localStorage.getItem("movieList")) || [] //local storage movie array is either in storage or empty
let searchMovie = "" //search term for movie
let btn = false

//if on the search page, run first fecth with input text
if(searchTerm){
    searchTerm.addEventListener("change", (e)=>{
        imdbMovieIdSearch(e.target.value)
        searchTerm.value = ""
    })
}

//the first fetch
//returns movie ids which are used in second search
async function imdbMovieIdSearch(movie){
    imdb = [] 
    const res = await fetch(`http://www.omdbapi.com/?apikey=6c697ef&s=${movie}`)
    const data = await res.json()
    if(data.Response === "False"){
      movieEl.innerHTML = `<p class="error">Unable to find what you're looking for. Please try another search.</p>`
    } else {

    data.Search.forEach((movie)=>{
    imdb.push(movie.imdbID)
    return imdb
 })
    imdbFullMovieDataSearch()
  }
}

//secondary search that gets the extended movie data
function imdbFullMovieDataSearch(){
    displayMovies = []
    imdb.forEach(async (el)=>{

    const res = await fetch(`http://www.omdbapi.com/?apikey=6c697ef&i=${el}`)
    const data = await res.json()
    displayMovies.push(data)
    
    movieEl.innerHTML = renderSearchMovies(displayMovies)
  })
}

//render the movies on the page
function renderSearchMovies(array){

let movieHtml = ''
    array.map((movie)=>{
        let posterSrc = (movie.Poster != "N/A") ? movie.Poster : "images/100x149.png"

        movieHtml +=  `
        <div class="movie-card">
            <img class="movie-poster" src=${posterSrc} alt="${movie.Title} poster" style="width: 100px"/>
            <div class="movie-contents>
            <p class="movie-title">${movie.Title} ⭐️ <span class="movie-rating">${movie.imdbRating}</span></p>
            <p class="movie-data"><span>${movie.Runtime}</span> ${movie.Genre} 
                <i class="fa-solid fa-circle-plus" data-movieid=${movie.imdbID}></i> <span id="${movie.imdbID}">WatchList</span></p>
            <p class="movie-plot">${movie.Plot}</p>
            </div>
        </div>
        `
       })
      return movieHtml
    }

///local storage section 

//update the font awesome icon and class when added to local storage
document.addEventListener("click", (e)=>{
    if(e.target.dataset.movieid){
        e.target.classList.remove("fa-circle-plus")
        e.target.classList.add("fa-circle-check")
       document.getElementById(e.target.dataset.movieid).textContent = "Added to watchlist"
        addToLocalStorage(e.target.dataset.movieid)
    } 
})

//check if in local storage
function checkLocal(movie){

const isInDb = likedMovies.some((el)=> el.imdbID === movie.imdbID)
    if(!isInDb){
    likedMovies.unshift(movie)
    }
}

function addToLocalStorage(movieId){
   
    const targetMovieObj =  displayMovies.filter((movie) =>{
        return movie.imdbID === movieId
    })[0]

    checkLocal(targetMovieObj)
    localStorage.setItem("movieList", JSON.stringify(likedMovies));    
}

//render watchlist movies or the message to add to watchlist
if(watchListArea && likedMovies.length > 0){
    watchListArea.innerHTML = renderWatchListMovies(likedMovies)
} else if (watchListArea && likedMovies.length == 0) {
    watchListArea.innerHTML = msg
}

//render watchlist
function renderWatchListMovies(array){
    if(array.length === 0){
        return msg
    } else {
    let movieHtml = ''
        array.map((movie)=>{
          let posterSrc = (movie.Poster != "N/A") ? movie.Poster : "images/100x149.png"
            movieHtml +=  `
            <div class="movie-card">
                <img class="movie-poster" src=${posterSrc} alt="${movie.Title} poster" style="width: 100px"/>
                <div class="movie-contents>
                <p class="movie-title">${movie.Title} ⭐️ <span class="movie-rating">${movie.imdbRating}</span></p>
                <p class="movie-data"><span>${movie.Runtime}</span> ${movie.Genre} 
                    <i class="fa-solid fa-circle-minus" data-removeid=${movie.imdbID}></i> Remove</p>
                <p class="movie-plot">${movie.Plot}</p>
                </div>
            </div>
            `
           })
          return movieHtml
        }
}
    
//remove from watchlist
if(watchListArea){
    document.addEventListener("click", (e)=>{
        if(e.target.dataset.removeid){
            let likedMovies = JSON.parse(localStorage.getItem("movieList"))
            const indexRemove = likedMovies.findIndex((movie) => movie.imdbID === e.target.dataset.removeid)
            likedMovies.splice(indexRemove, 1)
            watchListArea.innerHTML = renderWatchListMovies(likedMovies)
            localStorage.setItem("movieList", JSON.stringify(likedMovies))
        }
    })
}

