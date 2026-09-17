const DB = PropertiesService.getScriptProperties();





function doGet(e){


  const action =
  e.parameter.action;



  let result={};



  switch(action){



    case "init":


      result=createUser();


      break;




    case "feed":


      result=getFeed(
        Number(e.parameter.limit) || 5,
        Number(e.parameter.offset) || 0
      );


      break;




    case "comments":


      result=getComments(
        e.parameter.post
      );


      break;




    default:


      result={
        error:"invalid action"
      };


  }





  return ContentService
  .createTextOutput(
    JSON.stringify(result)
  )
  .setMimeType(
    ContentService.MimeType.JSON
  );


}









function doPost(e){



const data =
JSON.parse(e.postData.contents);



let result={};



switch(data.action){



case "heartbeat":

result=heartbeat(data);

break;




case "post":

result=createPost(data);

break;




case "comment":

result=createComment(data);

break;




case "generateKey":

result=generateUserKey(data);

break;




case "loginKey":

result=loginKey(data);

break;




default:


result={
error:"invalid"
};


}






return ContentService
.createTextOutput(
JSON.stringify(result)
)
.setMimeType(
ContentService.MimeType.JSON
);


}









// =======================
// KEY
// =======================


function generateKey(){


const chars =
"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


let key="";



for(let i=0;i<15;i++){


key +=
chars.charAt(
Math.floor(
Math.random()*chars.length
)
);


}



return key;


}









// =======================
// CREATE USER
// =======================


function createUser(){


let users =
JSON.parse(
DB.getProperty("users") || "{}"
);



let id =
"USR"+Date.now();



let username =
"user_"+
Math.random()
.toString(36)
.substring(2,8);





users[id]={


id:id,


username:username,


password:
Math.random()
.toString(36)
.substring(2,10),



key:generateKey(),



point:0,


activeMinute:0,


credit:1,


created:new Date()


};





DB.setProperty(
"users",
JSON.stringify(users)
);





return {


success:true,


user:users[id]


};


}









// =======================
// GENERATE KEY USER
// =======================


function generateUserKey(data){


let users =
JSON.parse(
DB.getProperty("users") || "{}"
);



let user =
users[data.user];



if(!user){


return {

error:"user not found"

};


}




user.key =
generateKey();



users[user.id]=user;



DB.setProperty(
"users",
JSON.stringify(users)
);



return {


success:true,


key:user.key


};


}









// =======================
// LOGIN KEY
// =======================


function loginKey(data){


let users =
JSON.parse(
DB.getProperty("users") || "{}"
);



for(let id in users){


let user =
users[id];



if(user.key == data.key){


return {


success:true,


user:user


};


}


}




return {


error:"key tidak ditemukan"


};


}









// =======================
// HEARTBEAT
// =======================


function heartbeat(data){


let users =
JSON.parse(
DB.getProperty("users") || "{}"
);



let user =
users[data.user];



if(!user){


return {


error:"user not found"


};


}





if(!user.key){


user.key =
generateKey();


}





user.activeMinute++;


user.credit++;




users[user.id]=user;



DB.setProperty(
"users",
JSON.stringify(users)
);





return {


success:true,


credit:user.credit,


active:user.activeMinute


};


}









// =======================
// CREATE POST
// =======================


function createPost(data){


let users =
JSON.parse(
DB.getProperty("users") || "{}"
);



let user =
users[data.user];



if(!user){


return {


error:"user not found"


};


}





if(user.credit < 1){


return {


error:"credit habis"


};


}





user.credit--;





let posts =
JSON.parse(
DB.getProperty("posts") || "[]"
);





posts.unshift({


id:"P"+Date.now(),


user:user.username,


text:data.text,


time:new Date(),


comments:[]


});





DB.setProperty(
"posts",
JSON.stringify(posts)
);



DB.setProperty(
"users",
JSON.stringify(users)
);





return {


success:true,


credit:user.credit


};


}









// =======================
// CREATE COMMENT
// =======================


function createComment(data){


let users =
JSON.parse(
DB.getProperty("users") || "{}"
);



let user =
users[data.user];



if(!user){


return {


error:"user not found"


};


}





if(user.credit < 1){


return {


error:"credit habis"


};


}





let posts =
JSON.parse(
DB.getProperty("posts") || "[]"
);



let post =
posts.find(
p=>p.id==data.post
);



if(!post){


return {


error:"post tidak ditemukan"


};


}




user.credit--;





if(!post.comments){


post.comments=[];


}





post.comments.push({


user:user.username,


text:data.text,


time:new Date()


});





users[user.id]=user;




DB.setProperty(
"posts",
JSON.stringify(posts)
);



DB.setProperty(
"users",
JSON.stringify(users)
);





return {


success:true,


credit:user.credit


};


}









// =======================
// FEED PAGINATION
// =======================


function getFeed(limit,offset){


let posts =
JSON.parse(
DB.getProperty("posts") || "[]"
);





let result =
posts
.slice(
offset,
offset + limit
)
.map(p=>{


return {


id:p.id,


user:p.user,


text:p.text,


time:p.time,


commentCount:
p.comments ?
p.comments.length :
0


};


});





return {


posts:result,


total:posts.length


};


}









// =======================
// LOAD COMMENTS
// =======================


function getComments(postId){


let posts =
JSON.parse(
DB.getProperty("posts") || "[]"
);



let post =
posts.find(
p=>p.id==postId
);



if(!post){


return {


error:"post tidak ditemukan"


};


}





return post.comments || [];


}
