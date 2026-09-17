let user = JSON.parse(
    localStorage.getItem("user") || "null"
);


let feedCache = [];


// ==========================
// API CONNECTOR
// ==========================

async function api(action, data = null) {


    try {


        if (data) {


            data.action = action;


            let response = await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify(data)

            });


            return await response.json();


        }



        let response = await fetch(
            API_URL + "?action=" + action
        );


        return await response.json();



    } catch (error) {


        console.log(error);


        return {

            error: "Koneksi gagal"

        };


    }


}






// ==========================
// START APP
// ==========================

async function start() {


    // jika user belum ada
    if (!user) {


        let result = await api("init");



        if (result.user) {


            user = result.user;



            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


        }


    }



    updateHeader();



    loadFeed();



    // heartbeat setiap menit

    setInterval(
        heartbeat,
        60000
    );


}







// ==========================
// UPDATE HEADER
// ==========================

function updateHeader(){



    if (!user)
        return;



    document
    .getElementById("headerUsername")
    .innerHTML =
    user.username;



    document
    .getElementById("headerCredit")
    .innerHTML =
    user.credit;



}








// ==========================
// HEARTBEAT AKTIF
// ==========================

async function heartbeat(){



    let result =
    await api(
        "heartbeat",
        {

            user:user.id

        }
    );



    if(result.credit !== undefined){



        user.credit =
        result.credit;



        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );



        updateHeader();


    }


}








// ==========================
// LOAD FEED
// ==========================

async function loadFeed(){



    let cache =
    localStorage.getItem(
        "feed"
    );



    if(cache){


        feedCache =
        JSON.parse(cache);



        renderFeed(
            feedCache
        );


    }





    let result =
    await api("feed");



    if(Array.isArray(result)){


        feedCache =
        result;



        localStorage.setItem(
            "feed",
            JSON.stringify(result)
        );



        renderFeed(
            result
        );


    }



}









// ==========================
// RENDER FEED
// ==========================

function renderFeed(posts){



    let html = "";



    if(posts.length === 0){


        html = `

        <div class="post-card">

        Belum ada postingan

        </div>

        `;


    }




    posts.forEach(post => {



        html += `


        <article class="post-card">


        <div class="post-header">


        <div class="small-avatar">

        👤

        </div>



        <div>


        <b>
        ${post.user}
        </b>


        <div class="time">

        ${formatTime(post.time)}

        </div>


        </div>


        </div>





        <div class="post-text">

        ${escapeHTML(post.text)}

        </div>





        <div class="post-action">


        <span>
        👍 Suka
        </span>


        <span>
        💬 Komentar
        </span>



        </div>



        </article>


        `;


    });



    document
    .getElementById("feed")
    .innerHTML =
    html;


}








// ==========================
// CREATE POST
// ==========================

async function post(){



    let input =
    document
    .getElementById("text");



    let text =
    input.value.trim();




    if(!text)
        return;



    let button =
    document.querySelector("button");



    button.disabled = true;



    let result =
    await api(
        "post",
        {

            user:user.id,

            text:text

        }
    );



    button.disabled = false;





    if(result.error){


        alert(result.error);


        return;


    }





    // update kredit

    user.credit =
    result.credit;



    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );



    updateHeader();





    let newPost = {


        id:"LOCAL_"+Date.now(),


        user:user.username,


        text:text,


        time:new Date(),


        comments:[]


    };





    feedCache.unshift(
        newPost
    );



    localStorage.setItem(
        "feed",
        JSON.stringify(feedCache)
    );



    renderFeed(
        feedCache
    );



    input.value="";



}









// ==========================
// UTILITIES
// ==========================


function escapeHTML(text){


    return text

    .replace(/</g,"&lt;")

    .replace(/>/g,"&gt;");


}





function formatTime(time){


    try{


        return new Date(time)
        .toLocaleString(
            "id-ID"
        );


    }catch{


        return "";

    }


}






function focusPost(){


    document
    .getElementById("text")
    .focus();


}






start();
