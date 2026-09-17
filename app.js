let user =
JSON.parse(
localStorage.user || "null"
);



let feedCache=[];



async function api(action,data){


if(data){

data.action=action;


return fetch(API_URL,{
method:"POST",
body:JSON.stringify(data)
})
.then(r=>r.json());


}


return fetch(
API_URL+"?action="+action
)
.then(r=>r.json());


}





async function start(){


if(!user){

let r=
await api("init");


user=r.user;


localStorage.user=
JSON.stringify(user);


}



renderUser();


loadFeed();


setInterval(
heartbeat,
60000
);


}







function renderUser(){


profile.innerHTML=
`
<b>${user.username}</b>
`;


credit.innerHTML=
user.credit;


}





async function loadFeed(){


let local=
localStorage.feed;



if(local){

renderFeed(
JSON.parse(local)
);

}



let data=
await api("feed");



feedCache=data;


localStorage.feed=
JSON.stringify(data);



renderFeed(data);



}








function renderFeed(posts){


let html="";


posts.forEach(p=>{


html+=`

<div class="post-card">


<div class="post-header">

<div class="small-avatar">
👤
</div>


<b>${p.user}</b>


</div>



<div class="post-text">

${p.text}

</div>



<div class="post-action">

👍 Suka

💬 Komentar

↗ Bagikan


</div>



</div>

`;


});


feed.innerHTML=html;


}








async function post(){


let text=
document.getElementById("text").value.trim();



if(!text)
return;



let r=
await api("post",
{

user:user.id,

text:text

});



if(r.error){

alert(r.error);

return;

}



user.credit=r.credit;

localStorage.user=
JSON.stringify(user);



document.getElementById("text")
.value="";



renderUser();



let newPost={

user:user.username,

text:text,

time:new Date(),

comments:[]

};


feedCache.unshift(newPost);


localStorage.feed=
JSON.stringify(feedCache);


renderFeed(feedCache);



}






async function heartbeat(){


let r=
await api(
"heartbeat",
{
user:user.id
}
);



user.credit=r.credit;


localStorage.user=
JSON.stringify(user);



renderUser();


}




function focusPost(){

document
.getElementById("text")
.focus();


}



start();
