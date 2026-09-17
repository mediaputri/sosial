let user =
JSON.parse(
localStorage.getItem("user")
);





async function api(action,data=null){


if(data){


data.action = action;


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


let valid = false;



// cek user lama di server

if(user){


let check =
await api(
"heartbeat",
{
user:user.id
}
);



if(!check.error){


valid = true;



user.credit =
check.credit;


user.activeMinute =
check.active;



localStorage.setItem(
"user",
JSON.stringify(user)
);



}

}



// jika user lokal tidak ditemukan

if(!valid){


localStorage.removeItem(
"user"
);



let res =
await api("init");



user =
res.user;



localStorage.setItem(
"user",
JSON.stringify(user)
);



}



showProfile();



setInterval(
heartbeat,
60000
);



loadFeed();


}










function showProfile(){


document
.getElementById("profile")
.innerHTML =

`
Username:
<b>${user.username}</b>

<br>

Credit:
<span id="credit">
${user.credit}
</span>

`;

}










async function heartbeat(){


let r =
await api(
"heartbeat",
{
user:user.id
}
);



if(r.error){


// user sudah tidak ada di server

localStorage.removeItem(
"user"
);


location.reload();


return;

}




if(r.credit !== undefined){


user.credit =
r.credit;


user.activeMinute =
r.active;



localStorage.setItem(
"user",
JSON.stringify(user)
);




let credit =
document.getElementById("credit");



if(credit){


credit.innerHTML =
user.credit;


}


}


}









async function post(){


let text =
document
.getElementById("text")
.value;



if(!text.trim()){

return;

}




let r =
await api(
"post",
{

user:user.id,

text:text

}

);





if(r.error){


alert(r.error);


return;


}





if(r.credit !== undefined){


user.credit =
r.credit;



localStorage.setItem(
"user",
JSON.stringify(user)
);



let credit =
document.getElementById("credit");



if(credit){


credit.innerHTML =
user.credit;


}


}





document
.getElementById("text")
.value = "";



loadFeed();


}









async function loadFeed(){


let posts =
await api("feed");



let html = "";




posts.forEach(p=>{


html += `

<div class="card">


<b>${p.user}</b>


<p>
${p.text}
</p>


<small>
${p.time}
</small>


</div>

`;


});





document
.getElementById("feed")
.innerHTML = html;


}







start();
