
const newVidReq = document.getElementById('newvidreq');
const reqList = document.getElementById('listOfRequests');
const searchBox = document.getElementById('search-box');  
const superUserId = "1995";
const state={
    sortBy:'newFirst',
    searchTerm:'',
    userId:'',
    isSuperUser:false,
    filterBy:'all',
}
/*render 1 video card with votes function*/
function createNewCard(vidInfo, injected = false){
   
    let cardContainer = document.createElement('div');

    cardContainer.innerHTML=` 
        <div class="card mb-3">
        ${state.isSuperUser ? 
            `<div class="card-header d-flex justify-content-between">
            <select id="admin_change_state_${vidInfo._id}">
            <option value="new">new</option>
            <option value="planned">planned</option>
            <option value="done">done</option>
            </select>
            <div id="vid_res_${vidInfo._id}" class="input-group ml-2 mr-5 ${vidInfo.status !='done'? `d-none`:''}">
            <input type="text" class="form-control" placeholder="paste youtube video ID" id="admin_vid_req_${vidInfo._id}">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" id="admin_save_vid_res_${vidInfo._id}">save</button>
            </div>
            </div>
            <button class="btn btn-danger" id="admin_del_vid_req_${vidInfo._id}">delete</button>
        </div>`
        :''}
            <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
                <h3>${vidInfo.topic_title}</h3>
                <p class="text-muted mb-2">${vidInfo.topic_details}</p>
                <p class="mb-0 text-muted">
                ${vidInfo.expected_result && `<strong>Expected results:</strong> ${vidInfo.expected_result}`}
                </p>
            </div>
           ${vidInfo.status==='done'? `<div class="ml-auto mr-3">
            <iframe width="300" height="170" src="https://www.youtube.com/embed/${vidInfo.video_ref.link}" ></iframe>
            </div>` :'' }
            <div class="d-flex flex-column text-center">
                <a id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
                <h3 id="score_${vidInfo._id}">${vidInfo.votes.ups.length - vidInfo.votes.downs.length}</h3>
                <a id="votes_downs_${vidInfo._id}" class="btn btn-link">🔻</a>
            </div>
           
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
            <div class=${vidInfo.status === 'done'? 'text-success':vidInfo.status === 'planned'? 'text-primary':''}>
                <span >${vidInfo.status.toUpperCase()} ${vidInfo.status === 'done'? `On: ${new Date(vidInfo.video_ref.date).toLocaleDateString()}` :''} </span>
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


    if(state.isSuperUser){
        const adminChangeStateElm = document.getElementById(`admin_change_state_${vidInfo._id}`);
        const adminVidResContainer = document.getElementById(`vid_res_${vidInfo._id}`);
        const adminVideReqElm = document.getElementById(`admin_vid_req_${vidInfo._id}`);
        const adminSaveVidResElm = document.getElementById(`admin_save_vid_res_${vidInfo._id}`);
        const adminDelVidReqElm = document.getElementById(`admin_del_vid_req_${vidInfo._id}`);
        adminChangeStateElm.value = vidInfo.status;
        adminVideReqElm.value = vidInfo.video_ref.link;
        adminChangeStateElm.addEventListener('change',(e)=>{
            if(e.target.value === "done"){
                adminVidResContainer.classList.remove("d-none");
            }else{
                adminVidResContainer.classList.add("d-none");
                updatevidReq(vidInfo._id, e.target.value, '');
            }
        })
        adminSaveVidResElm.addEventListener('click',(e)=>{
            if(!adminVideReqElm.value){
                adminVideReqElm.classList.add('is-invalid');
                adminVideReqElm.addEventListener('input', (e)=>{
                    adminVideReqElm.classList.remove('is-invalid');
                })
                return;
            }

            
            updatevidReq(vidInfo._id, 'done', adminVideReqElm.value);
            
        })


        adminDelVidReqElm.addEventListener('click',()=>{
            fetch('http://localhost:7777/video-request',{
                method:"DELETE",
                headers:{'content-Type':'application/json'},
                body:JSON.stringify({
                    id:vidInfo._id,
                }),
            })
            .then(window.location.reload())
        })
    }

    
    applyVotesStyel(vidInfo._id, vidInfo.votes,'' ,vidInfo.status==='done');
    /*card votes up/down*/

    const votesScoreElm = document.getElementById(`score_${vidInfo._id}`);
    const votesElm = document.querySelectorAll(`[id^=votes][id$=_${vidInfo._id}]`);
   
    votesElm.forEach((elm) =>{
        if(state.isSuperUser || vidInfo.status==='done'){return;}
        elm.addEventListener('click', function(e){
            e.preventDefault();
            const [, vote_type, id] = e.target.getAttribute('id').split('_');
            fetch('http://localhost:7777/video-request/vote',{
                method:"PUT",
                headers:{'content-Type':'application/json'},
                body: JSON.stringify({id, vote_type, user_id:state.userId})
            })
            .then(blob => blob.json())
            .then(data => {
                votesScoreElm.innerHTML = data.ups.length - data.downs.length;
                applyVotesStyel(id, data, vote_type, vidInfo.status==='done');
            })
        })
    })
   
} 
function updatevidReq(id,status,resVideo){
    fetch('http://localhost:7777/video-request',{
                method:"PUT",
                headers:{'content-Type':'application/json'},
                body:JSON.stringify({
                    id,
                    status, 
                    resVideo ,
                }),
            })
            .then(resl => resl.json())
            .then(window.location.reload())

}
    
function applyVotesStyel(video_id, votes_list, vote_type, isDisabled){
    const votesUpsElm = document.getElementById(`votes_ups_${video_id}`);
    const votesDownsElm = document.getElementById(`votes_downs_${video_id}`);
    if(state.isSuperUser || isDisabled == true){
        votesUpsElm.style.opacity = '0.5';
        votesUpsElm.style.cursor="not-allowed";
        votesDownsElm.style.opacity = '0.5';
        votesDownsElm.style.cursor="not-allowed";
        return;
    }
    if(!vote_type){
        if(votes_list.ups.includes(state.userId)){
            vote_type='ups';
        }else if(votes_list.downs.includes(state.userId)){
            vote_type='downs';
        }else{
            return;
        }
    }
    const voteDirElm= vote_type==='ups'? votesUpsElm:votesDownsElm;
    const voteOtherElm= vote_type==='ups'? votesDownsElm:votesUpsElm;
    if(votes_list[vote_type].includes(state.userId)){
        voteDirElm.style.opacity = '0.5';
        voteOtherElm.style.opacity = '1';
    }else{
        votesUpsElm.style.opacity = '1';
        votesDownsElm.style.opacity = '1';
    }
}
/*load cards' data and add it to the section*/
function loadAllReq(sortBy="newFirst",searchTerm='', filterBy='all'){
    fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`)
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


function validateForm(formData){
  
    const title = formData.get('topic_title');
    const details = formData.get('topic_details');
    
   
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
    loadAllReq(state.sortBy,state.searchTerm, state.filterBy);
    /*user logged in */
    const formLoginElm = document.getElementById('login-form');
    const appContentElm = document.getElementById('app-content');
    if(window.location.search){
         state.userId = new URLSearchParams(window.location.search).get('id');
         if(state.userId === superUserId){
            state.isSuperUser = true;
            newVidReq.classList.add("d-none");
         }
        formLoginElm.classList.add('d-none');
        appContentElm.classList.remove('d-none');
    }

    /*search*/
    searchBox.addEventListener(
        'input', 
        debounce((e)=>{
            state.searchTerm = e.target.value;
            loadAllReq(state.sortBy,state.searchTerm,state.filterBy);
        },300)
    )
    /*filter by*/
    const filter = document.querySelectorAll('[id^=filter_]');
    filter.forEach(ele =>{
        ele.addEventListener('click',(e)=>{
            e.preventDefault();
            filter.forEach(elm => elm.classList.remove('active'));
            e.target.classList.add('active');
            state.filterBy = e.target.getAttribute('id').split('_')[1];
            loadAllReq(state.sortBy,state.searchTerm,state.filterBy);
        })
    })
    /*cort req cards*/
    let sortLabel = document.querySelectorAll('[id*=sort-by]');
    sortLabel.forEach((ele)=>{
        
        ele.addEventListener('click', function(e){
            e.preventDefault();
            sortLabel.forEach((ele)=>ele.classList.remove('active'));
            e.target.classList.add('active');
             state.sortBy = this.querySelector('input').value;
            loadAllReq(state.sortBy,state.searchTerm,state.filterBy);
        })
    })
   
       
    /*customly pass form data onsubmit*/
    
    newVidReq.addEventListener('submit', (e)=>{
      e.preventDefault();
      const formData = new FormData(newVidReq);
      formData.append('author_id', state.userId);
      let validator = validateForm(formData);
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