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
Key Akun:
</p>


<code id="userKey">
${user.key || "Belum dibuat"}
</code>



<button onclick="generateKey()">

Generate Key Baru

</button>



<hr>



<h3>
Login Perangkat Lain
</h3>


<input
id="loginKey"
placeholder="Masukkan key 15 digit"
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


document
.getElementById("accountPopup")
.style.display="flex";


}






function closeAccount(){


document
.getElementById("accountPopup")
.style.display="none";


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









async function generateKey(){


let r =
await api(
"generateKey",
{
user:user.id
}
);



if(r.error){


alert(r.error);


return;


}




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



if(!key){


alert(
"Masukkan key"
);


return;


}





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




if(r.success){


user =
r.user;



localStorage.setItem(
"user",
JSON.stringify(user)
);



alert(
"Login berhasil"
);



location.reload();


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
.value="";



loadFeed();


}









async function loadFeed(){


let posts =
await api("feed");



let html="";



posts.forEach(p=>{


html +=`

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


</div>


`;



});




document
.getElementById("feed")
.innerHTML =
html;


}







start();
