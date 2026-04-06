let currentSong = new Audio();
let songs;
let currfolder
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60)
    const reminingseconds = Math.floor(seconds % 60)
    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(reminingseconds).padStart(2, '0')
    return `${formattedMinutes}:${formattedSeconds}`
}

async function getSongs(folder) {

    currfolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + ` <li>
                            <div class="flex items-center songname">

                                <i class="fa-solid fa-music"></i>
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>song artist</div>
                                </div>
                            </div>
                            <div class="playnow flex items-center">

                                <span>Play Now</span>
                                <i class="fas fa-circle-play"></i>
                            </div>
                        </li>`
    }



    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => (
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    ))
    return songs
}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)

    currentSong.src = `/${currfolder}/` + track
    if (!pause) {

        currentSong.play()

    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
}
async function displayAlbums() {
    // 1. Fetch the manifest instead of the folder
    let a = await fetch("/songs.json");
    let data = await a.json();
    
    let cardcontainer = document.querySelector(".card-container");
    cardcontainer.innerHTML = ""; // Clear container

    for (const playlist of data.playlists) {
        cardcontainer.innerHTML += `
            <div data-folder="${playlist.folder}" class="card">
                <div class="play">
                    <i class="fa-solid fa-circle-play play-button"></i>
                </div>
                <img src="/songs/${playlist.folder}/cover.webp" alt="" class="rounded">
                <h3>${playlist.title}</h3>
                <p>${playlist.description}</p>
            </div>`;
    }

    // Re-attach listeners...
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // Use the list from our JSON instead of fetching a directory
            const folderName = item.currentTarget.dataset.folder;
            const selectedPlaylist = data.playlists.find(p => p.folder === folderName);
            songs = selectedPlaylist.songs; 
            currfolder = `songs/${folderName}`;
            
            // Update your UI and play first song
            updateSongListUI(songs); 
            playMusic(songs[0]);
        });
    });
}
async function main() {
    await getSongs(`songs/animal`)
    playMusic(songs[0], true)


    displayAlbums()

    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play()
            play.classList.replace("fa-play","fa-pause")
            
        }
        else{
            currentSong.pause()
            play.classList.replace("fa-pause","fa-play")
        }
        // play.classList.toggle("fa-play")
        // play.classList.toggle("fa-pause")
        // currentSong.paused ? currentSong.play() : currentSong.pause()
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


    document.querySelector(".fa-bars").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })
    document.querySelector(".fa-close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        console.log('previous cliked');
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log('next cliked');
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])

        }

    })


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100

    })


    document.querySelector(".fa-volume-high").addEventListener("click", e => {
        if (e.target.classList[1] == "fa-volume-high") {
            e.target.classList.replace("fa-volume-high", "fa-volume-mute")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else {
            e.target.classList.replace("fa-volume-mute", "fa-volume-high")
            currentSong.volume = .20
            document.querySelector(".range").getElementsByTagName("input")[0].value=20


        }

    })


}
main()
