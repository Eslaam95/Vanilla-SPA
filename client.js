let sortBy='newFirst';
let searchTerm ='';
const reqList = document.getElementById('listOfRequests');
const searchBox = document.getElementById('search-box');  
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

/*MAIN*/
document.addEventListener('DOMContentLoaded', ()=>{
    /*display req cards*/
    loadAllReq(sortBy,searchTerm);

    searchBox.addEventListener(
        'input', 
        debounce((e)=>{
            searchTerm = e.target.value;
            loadAllReq(sortBy,searchTerm);
        },300)
    )
    /*cort req cards*/
    let sortLabel = document.querySelectorAll('[id*=sort-by]');
    sortLabel.forEach((ele)=>{
        ele.addEventListener('click', function(e){
            e.preventDefault();
             sortBy = this.querySelector('input').value;
            loadAllReq(sortBy,searchTerm);
        })
    })
   
       
    /*customly pass form data onsubmit*/
    const newVidReq = document.getElementById('newvidreq');
    newVidReq.addEventListener('submit', (e)=>{
      e.preventDefault();
      const formData = new FormData(newVidReq);
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