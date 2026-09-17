let user =
JSON.parse(
localStorage.getItem("user")
);



let feedOffset = 0;

const feedLimit = 5;

let loadingFeed = false;






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


let valid=false;



if(user){


let check =
await api(
"heartbeat",
{
user:user.id
}
);



if(!check.error){


valid=true;



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





if(!valid){


localStorage.removeItem(
"user"
);



let res =
await api("init");



user=res.user;



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



loadFeed(true);


}









function showProfile(){


document
.getElementById("profile")
.innerHTML =


`

<div class="profile-bar">


<div class="profile-item">

<span>
Username
</span>

<b>
${user.username}
</b>

</div>



<div class="profile-item">

<span>
Credit
</span>

<b id="credit">
${user.credit}
</b>

</div>


</div>



<button
class="account-btn"
onclick="openAccount()"
>
Akun & Key
</button>


<div id="accountPopup" class="popup">


<div class="popup-box">


<h3>
Pengaturan Akun
</h3>



<p>
Key akun:
</p>


<code id="userKey">
${user.key || "Belum ada"}
</code>



<button onclick="generateKey()">
Generate Key Baru
</button>



<hr>


<h3>
Login perangkat lain
</h3>


<input
id="loginKey"
placeholder="Masukkan key"
maxlength="15"
>



<button onclick="loginKey()">
LOGIN
</button>



<button onclick="closeAccount()">
Tutup
</button>



</div>


</div>


`;

}









function openAccount(){


let popup =
document.getElementById(
"accountPopup"
);


if(popup){

popup.style.display="flex";

}


}




function closeAccount(){


let popup =
document.getElementById(
"accountPopup"
);


if(popup){

popup.style.display="none";

}


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


localStorage.removeItem(
"user"
);


location.reload();


return;


}



user.credit =
r.credit;


user.activeMinute =
r.active;



localStorage.setItem(
"user",
JSON.stringify(user)
);



let credit =
document.getElementById(
"credit"
);



if(credit){

credit.innerHTML =
user.credit;

}


}









async function generateKey(){


let r =
await api(
"generateKey",
{
user:user.id
}
);



if(r.key){


user.key =
r.key;



localStorage.setItem(
"user",
JSON.stringify(user)
);



document
.getElementById("userKey")
.innerHTML =
user.key;



alert(
"Key berhasil dibuat"
);


}


}









async function loginKey(){


let key =
document
.getElementById("loginKey")
.value
.trim();



let r =
await api(
"loginKey",
{
key:key
}
);



if(r.error){


alert(r.error);


return;


}




user =
r.user;



localStorage.setItem(
"user",
JSON.stringify(user)
);



location.reload();


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





user.credit =
r.credit;



localStorage.setItem(
"user",
JSON.stringify(user)
);



document
.getElementById("credit")
.innerHTML =
user.credit;



document
.getElementById("text")
.value="";



feedOffset=0;


loadFeed(true);


}









// ======================
// LOAD FEED PAGINATION
// ======================


async function loadFeed(reset=false){



if(loadingFeed){

return;

}



loadingFeed=true;



if(reset){


feedOffset=0;


document
.getElementById("feed")
.innerHTML="";


}




let r =
await fetch(
API_URL+
"?action=feed"+
"&limit="+feedLimit+
"&offset="+feedOffset
)
.then(x=>x.json());





let html="";





r.posts.forEach(p=>{


html += `

<div class="card">


<b>
${p.user}
</b>



<p>
${p.text}
</p>



<small>
${p.time}
</small>



<br>


<button
onclick="loadComments('${p.id}')"
>

Lihat Komentar (${p.commentCount})

</button>



<div
id="comments-${p.id}"
class="comments"
>

</div>



</div>


`;



});





document
.getElementById("feed")
.innerHTML += html;




feedOffset += r.posts.length;





let old =
document.getElementById(
"loadMore"
);



if(old){

old.remove();

}





if(feedOffset < r.total){



document
.getElementById("feed")
.innerHTML +=


`

<button
id="loadMore"
onclick="loadFeed(false)"
>

Load More

</button>

`;



}




loadingFeed=false;


}









// ======================
// LOAD COMMENT SAAT KLIK
// ======================


async function loadComments(postId){



let box =
document.getElementById(
"comments-"+postId
);



if(!box){

return;

}



if(box.innerHTML){


box.innerHTML="";


return;


}




let r =
await fetch(
API_URL+
"?action=comments"+
"&post="+postId
)
.then(x=>x.json());




let html="";



r.forEach(c=>{


html += `

<div class="comment">


<b>
${c.user}
</b>


<p>
${c.text}
</p>


<small>
${c.time}
</small>


</div>


`;



});




html += `

<input

id="comment-${postId}"

placeholder="Tulis komentar..."

>


<button
onclick="comment('${postId}')"
>

Komentar

</button>

`;




box.innerHTML=html;


}









async function comment(postId){


let input =
document.getElementById(
"comment-"+postId
);



if(!input){

return;

}




let text =
input.value.trim();



if(!text){

return;

}




let r =
await api(
"comment",
{

user:user.id,

post:postId,

text:text

}

);





if(r.error){


alert(r.error);


return;


}





user.credit =
r.credit;



localStorage.setItem(
"user",
JSON.stringify(user)
);



document
.getElementById("credit")
.innerHTML =
user.credit;



loadComments(postId);


}









start();
