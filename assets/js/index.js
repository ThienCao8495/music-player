/*
    1. Render song
    2. Scroll top
    3. Play/pause/seek
    4. CD rotate
    5. Next/prev
    6. Random
    7. Next/repeat when ended
    8. Active song
    9. Scroll active song into view 
    10. Play song when click 
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

var app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songs: [
        {
            name: 'Lucky Boy',
            singer: 'Dlow',
            path: './assets/music/song_1.mp3',
            image: './assets/img/song_1.jpg'
        },
        {
            name: 'Ngày Khác Lạ',
            singer: 'Đen',
            path: './assets/music/song_2.mp3',
            image: './assets/img/song_2.jpg'
        },
        {
            name: 'Bài Này Chill Phết',
            singer: 'Đen, Min',
            path: './assets/music/song_3.mp3',
            image: './assets/img/song_3.jpg'
        },
        {
            name: 'Gặp Nhưng Không Ở Lại',
            singer: 'Hiền Hồ',
            path: './assets/music/song_4.mp3',
            image: './assets/img/song_4.jpg'
        },
        {
            name: 'Ai Mang Cô Đơn Đi',
            singer: 'K-ICM, APJ',
            path: './assets/music/song_5.mp3',
            image: './assets/img/song_5.jpg'
        },
        {
            name: 'Em Hát Ai Nghe',
            singer: 'Orange',
            path: './assets/music/song_6.mp3',
            image: './assets/img/song_6.jpg'
        },
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}');"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>                
            `
        })
        
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xu ly CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 20000,
            iterations: Infinity
        })
        cdThumbAnimate.pause() 
        // Xử lí phòng to/thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = (newCdWidth > 50) ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth/cdWidth > 0 ? newCdWidth/cdWidth : 0
        }
        // Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()          
            } else {
                audio.play()
            }
        }
        // Khi song play
        audio.onplay = function() {
            player.classList.add('playing')
            _this.isPlaying = true 
            cdThumbAnimate.play()            
        }
        // Khi song pause
        audio.onpause = function() {
            player.classList.remove('playing')  
            _this.isPlaying = false 
            cdThumbAnimate.pause() 
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
            // console.log(audio.currentTime / audio.duration * 100)
        }

        // Xu ly khi tua songs
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration / 100
            audio.currentTime = seekTime
        }

        // Xu ly next song song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
        }

        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
        }

        // Xu ly bat/tat random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom 
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xu ly phat lap lai song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat 
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xu ly audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        } 

        playlist.onclick = function(e) {
            // ????? TODO
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('option')) {
                // Xu ly khi click vao songs
                if(songNode) {
                    console.log(songNode.dataset.index)
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },
    scollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        },200)
    },
    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
        this.render()
        this.scollToActiveSong()
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
        this.render()
        this.scollToActiveSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe và xử lí các sự kiện (DOM events)
        this.handleEvents()

        this.loadCurrentSong()

        // Render Playlist 
        this.render()
    }
}

app.start()

