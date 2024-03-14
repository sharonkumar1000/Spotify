let currentSong = new Audio();
let songs
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}




async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    songs= []
    let tds = div.getElementsByTagName("a")
    for (let index = 0; index < tds.length; index++) {
        const element = tds[index];
        if(element.href.endsWith(".mp3.preview")){
            songs.push(element.href)
        }   
    }



    let songUL = document.querySelector(".group3").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        if(song.length > 0){
            songUL.innerHTML = songUL.innerHTML+`<li>  
            <img src="music.svg" alt="no image">
                        <div class="info">
                            <div>${song.split(`${currFolder}/`)[1].replace("mp3.preview","")}</div>
                            <div>Sharon</div>
                        </div>
                        <div class="playnow">
                            <span>play now</span>
                            <img src="play.svg" alt="">
                        </div>
            
            <li>`;
        }
        
    }

    //attach a 
    Array.from(document.querySelector(".group3").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",(element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        }))
    });


}

const playMusic =(music,pause = false) => {
    currentSong.src = `http://127.0.0.1:5500/${currFolder}/`+music+"mp3"
    //   var audio = new Audio()
    if(!pause){
        currentSong.play()
    }
    document.querySelector(".songinfo").innerHTML = music
        // document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let cardContainer = document.querySelector(".container")
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        // console.log(e.href)
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="box" data-folder="${folder}">
            <div class="boximg" >
                <img class = "box1img" src="/songs/${folder}/cover.jpg" alt="no image">
            </div>
            <div class="boxtext">
                <h4>${response.title}</h4>
                <h6>${response.description}</h6>
            </div>
            <div class="playicon">
                <img class = "iconimg" src="playicon.svg" alt="noimage">
            </div>
        </div>
        `
        }
    }

     //load the play list
     Array.from(document.getElementsByClassName("box")).forEach(e =>{
        e.addEventListener("click",async item=>{
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
        
}

async function main(){
    
    
    songs = await getSongs("songs/ncs");
    // playMusic(songs[0],true)
    
    //display all the albums ib he page

    await displayAlbums()

    // Attach play pause buttons
    play.addEventListener("click" ,()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    currentSong.addEventListener("timeupdate" ,()=>{
        let ct = secondsToMinutesSeconds(currentSong.currentTime)
        let cd = secondsToMinutesSeconds(currentSong.duration)
        document.querySelector(".songtime").innerHTML = secondsToMinutesSeconds(currentSong.currentTime)+":"+secondsToMinutesSeconds(currentSong.duration)
        document.querySelector(".circle").style.left = ((currentSong.currentTime/currentSong.duration)*100)+"%"
    })
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let ct = e.offsetX/e.target.getBoundingClientRect().width
        document.querySelector(".circle").style.left = (ct)*100 + "%"
        currentSong.currentTime = ct*currentSong.duration
    })
    // Add an event listener for previous and next
    prev.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src+".preview")
        if(index-1 >= 0){
            playMusic(songs[index-1].split("/songs/")[1].replace("mp3.preview",""))
            // song.split("/songs/")[1].replace("mp3.preview","")

        }
    })
    next.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src+".preview")
        if(index+1 < songs.length){
            playMusic(songs[index+1].split("/songs/")[1].replace("mp3.preview",""))
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume = e.target.value/100
        console.log(currentSong.volume)
    })


   
}
main()