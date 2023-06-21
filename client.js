

const reqList = document.getElementById('listOfRequests');
const searchBox = document.getElementById('search-box');  

const state={
    sortBy:'newFirst',
    searchTerm:'',
    userId:'',
}
/*render 1 video card with votes function*/
function createNewCard(vidInfo, injected = false){
   
    let cardContainer = document.createElement('div');

    cardContainer.innerHTML=` 
        <div class="card mb-3">
            <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
                <h3>${vidInfo.topic_title}</h3>
                <p class="text-muted mb-2">${vidInfo.topic_details}</p>
                <p class="mb-0 text-muted">
                ${vidInfo.expected_result && `<strong>Expected results:</strong> ${vidInfo.expected_result}`}
                </p>
            </div>
            <div class="d-flex flex-column text-center">
                <a id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
                <h3 id="votes_score_${vidInfo._id}">${vidInfo.votes.ups - vidInfo.votes.downs}</h3>
                <a id="votes_downs_${vidInfo._id}" class="btn btn-link">🔻</a>
            </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
            <div>
                <span class="text-info">${vidInfo.status.toUpperCase()}</span>
                &bullet; added by <strong>${vidInfo.author_name}</strong> on
                <strong>${new Date(vidInfo.submit_date).toLocaleDateString()}</strong>
            </div>
            <div
                class="d-flex justify-content-center flex-column 408ml-auto mr-2"
            >
                <div class="badge badge-success">
                ${vidInfo.target_level}
                </div>
            </div>
            </div>
        </div>`;
    if(injected === true){
        reqList.prepend(cardContainer); 
    }else{
        reqList.appendChild(cardContainer); 
    }

      
    /*card votes up/down*/
    const votesUpsElm = document.getElementById(`votes_ups_${vidInfo._id}`);
    const votesDownsElm = document.getElementById(`votes_downs_${vidInfo._id}`);
    const votesScoreElm = document.getElementById(`votes_score_${vidInfo._id}`);
    
    votesUpsElm.addEventListener('click', (e) =>{
        
        fetch('http://localhost:7777/video-request/vote',{
            method:"PUT",
            headers:{'content-Type':'application/json'},
            body: JSON.stringify({id:vidInfo._id, vote_type:'ups'})
        })
        .then(blob => blob.json())
        .then(data => votesScoreElm.innerHTML = data.ups - data.downs)
    })
    votesDownsElm.addEventListener('click', (e) =>{
        
        fetch('http://localhost:7777/video-request/vote',{
            method:"PUT",
            headers:{'content-Type':'application/json'},
            body: JSON.stringify({id:vidInfo._id, vote_type:'downs'})
        })
        .then(blob => blob.json())
        .then(data => votesScoreElm.innerHTML = data.ups - data.downs)
    })

}

/*load cards' data and add it to the section*/
function loadAllReq(sortBy="newFirst",searchTerm=''){
    fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`)
    .then(blob => blob.json())
    .then((data) => {
        reqList.innerHTML='';
        data.forEach((vidInfo)=>{  
            createNewCard(vidInfo);
            
        })
    })
}

/*international debounce*/
function debounce(fn,time){
    let timeout;
    return function(...args){
        clearTimeout(timeout);
        timeout= setTimeout(()=>{fn.apply(this,args)}, time)
    }
}


function valideForm(formData){
    /*const name = formData.get('author_name');
    const mail = formData.get('author_email');*/
    const title = formData.get('topic_title');
    const details = formData.get('topic_details');
    
    /*if(!name){
        document.querySelector('[name=author_name]').classList.add("is-invalid");
        
    }
    const mailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if(!mail || !(mailPattern.test(mail))){
        document.querySelector('[name=author_email]').classList.add("is-invalid");
        
    } */
    if(!title || title.length > 30){
        document.querySelector('[name=topic_title]').classList.add("is-invalid");
        
    } if(!details){
        document.querySelector('[name=topic_details]').classList.add("is-invalid");
        
    }
    let invalidElems = document.querySelectorAll(".is-invalid");
    if (invalidElems.length){
        console.log("I'm here");
        invalidElems.forEach((ele)=>{
            ele.addEventListener('input',(e)=>{
                e.target.classList.remove("is-invalid");
            })
        })
        return false;
    }
   
        return true;
    
    
}

/*MAIN*/
document.addEventListener('DOMContentLoaded', ()=>{
    /*display req cards*/
    loadAllReq(state.sortBy,state.searchTerm);
    /*user logged in */
    const formLoginElm = document.getElementById('login-form');
    const appContentElm = document.getElementById('app-content');
    if(window.location.search){
         state.userId = new URLSearchParams(window.location.search).get('id');
        formLoginElm.classList.add('d-none');
        appContentElm.classList.remove('d-none');
    }

    /*search*/
    searchBox.addEventListener(
        'input', 
        debounce((e)=>{
            state.searchTerm = e.target.value;
            loadAllReq(state.sortBy,state.searchTerm);
        },300)
    )
    /*cort req cards*/
    let sortLabel = document.querySelectorAll('[id*=sort-by]');
    sortLabel.forEach((ele)=>{
        ele.addEventListener('click', function(e){
            e.preventDefault();
             state.sortBy = this.querySelector('input').value;
            loadAllReq(state.sortBy,state.searchTerm);
        })
    })
   
       
    /*customly pass form data onsubmit*/
    const newVidReq = document.getElementById('newvidreq');
    newVidReq.addEventListener('submit', (e)=>{
      e.preventDefault();
      const formData = new FormData(newVidReq);
      formData.append('author_id', state.userId);
      let validator = valideForm(formData);
      if (!validator){console.log("failed");return;}
      fetch('http://localhost:7777/video-request',{
          method: 'POST',
          body: formData,
      })
      .then(blob =>  blob.json() )
      .then((vidInfo) => {
       
        createNewCard(vidInfo, true);
    })
      
    })

  })