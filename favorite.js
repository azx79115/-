const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTERS_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
// 新增電影清單函式
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    //title,image
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTERS_URL + item.image}" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id='${item.id}'>X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}
// more按鈕監聽器
dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(e.target.dataset.id))
  }
})
// 顯示電影詳細資料函式
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date:' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
      <img src ='${POSTERS_URL + data.image}' alt ='movie-poster' class='img-fluid'>
    `
    })
}
// 刪除favorite電影清單函式
function removeFavorite(id) {
  if (!movies || !movies.length) return
  // 透過id找到要刪除的電影index
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if(movieIndex === -1) return
  //刪除該筆電影
  movies.splice(movieIndex,1)
  //存回local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}
// 顯示favorite清單
renderMovieList(movies)