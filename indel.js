const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTERS_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
// 搜尋功能
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
//每一頁要顯示幾部電影
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
const modeChangSwitch = document.querySelector('#change-mode')
//儲存符合拆選的目標
let filteredMovies = []
//紀錄目前分頁，確保切換模式分頁不會跑掉
let currentPage = 1


// 新增電影清單函式
function renderMovieList(data) {
if(dataPanel.dataset.mode === 'card-mode'){
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
              <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
} else if (dataPanel.dataset.mode === 'list-mode') {
  let rawHTML = `<ul class="list-group">`
  data.forEach((item) => {
    //title,id
    rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
          <h5 class="card-title pt-1">${item.title}</h5>
          <div>
            <button class="btn btn-primary
             btn-show-movie" data-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">more</button>
             <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
    `
  })
  rawHTML += `</ul>`
  dataPanel.innerHTML = rawHTML
}
}

// 串接api
axios
.get(INDEX_URL)
.then(response => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
  // console.log(movies)
  
})
.catch(err => console.log(err))

// more按鈕監聽器
dataPanel.addEventListener('click',function onPanelClicked(e){
  if (e.target.matches('.btn-show-movie')){
    showMovieModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
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
//將電影加入我的最愛函式
function addToFavorite (id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if(list.some (movie => movie.id === id)) {
    return alert('此電影已經收藏在清單囉!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies',JSON.stringify(list))
}
//監聽表單提交事件
searchForm.addEventListener('submit',function onSearchFormSubmitted(e) {
  e.preventDefault()//預防瀏覽器預設行為
  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  //條件篩選
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
 //錯誤處理:輸入無效字串 
 if (filteredMovies.length === 0) {
  return alert(`您輸入的關鍵字:${keyword}沒有符合條件的電影`)
 }
 currentPage = 1
 //重制分頁器
  renderPaginator(filteredMovies.length)
 
  //將條件符合輸出至畫面
  renderMovieList(getMoviesByPage(currentPage))
})
//將指定數量電影份入分頁
function getMoviesByPage(page) {
  //判斷data變數為何? 如果filteredMovies 有東西就用filteredMovies，沒有就用movies
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex,startIndex + MOVIES_PER_PAGE)
}
//建立分頁
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template
  let rawHTML = ''
  
  for(let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" data-page='${page}' href="#">${page}</a></li>
    `
    //放回html
    paginator.innerHTML = rawHTML
  }
}
//分頁監聽器
paginator.addEventListener('click',function onPaginatorClicked(e) {
  //如果被點擊的不是a標籤，結束
  if(e.target.tagName !== 'A') return
  //透過dataset取得被點擊的頁數
  const page = Number(e.target.dataset.page)
  currentPage = page
  //更新頁面
  renderMovieList(getMoviesByPage(currentPage))
})

//切換顯示方式
function changDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode === displayMode
}

//監聽切換事件
modeChangSwitch.addEventListener('click',function onSwitchClicked(e) {
  if(e.target.matches('#card-mode-button')) {
    changDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (e.target.matches('#list-mode-button')) {
    changDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})