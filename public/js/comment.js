let inProgressNewPost = false;
function postNewComment(deviceid){
	//console.log("the user is ++++++" + userId)
	//let postTitle = document.getElementById("postTitle").value;
	let postContent = document.getElementById("postContent").value;

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange=function() {
		if (this.readyState == 4 && this.status == 200) {
            //alert("successfully added!");
			window.location.replace("/getMobileById?dev_id="+deviceid);
		}else if(this.readyState == 4 && this.status == 400){
			alert("There was a problem adding this post. Please try again, or refresh the page.");
		}
	};

    xhttp.open("POST", "/getMobileById/comment", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	let myData = {};
	//myData.username = userId;
	//myData.postTitle = postTitle;
	myData.postContent = postContent;
	xhttp.send(JSON.stringify(myData));
}


function newComment(deviceid){
	if(!inProgressNewPost){
		inProgressNewPost = true;
		let postParent = document.getElementById("postParent");
		//let postTitle = document.createElement("input");
		let postContent = document.createElement("textarea");
		let postSave = document.createElement("button");
		let postTempDiv = document.createElement("div");

		postSave.innerHTML = "Add new post!";
		postSave.setAttribute("class", "post-entries");
		postSave.setAttribute( "onClick", "javascript: postNewComment('"+ deviceid +"');" );

		postContent.setAttribute("class", "post-entries");
		postContent.setAttribute("placeholder", "Post Content");
		postContent.setAttribute("id", "postContent");
		postContent.setAttribute("style", "height: 200px; width: 80%;");

		//postTitle.setAttribute("class", "post-entries");
		//postTitle.setAttribute("placeholder", "Post Title");
		//postTitle.setAttribute("id", "postTitle");	

		//postTempDiv.append(postTitle);
		postTempDiv.append(postContent);
		postTempDiv.append(postSave);
		postTempDiv.setAttribute("class", "post");

		postParent.prepend(postTempDiv);
	}
}

function removePost(author_name,userId,postId){
	// console.log(author_name);
	// console.log(userId);
	// console.log(postId);
	if(author_name===userId){
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange=function() {
			if (this.readyState == 4 && this.status == 200) {
                //alert("Successfully deleted!");
				window.location.replace("/getMobileById");
			}else if(this.readyState == 4 && this.status == 400){
				alert("There was a problem deleting this post.!");
			}else{
				//not done yet
				//console.log("Hello " + this.status + " and  " + this.readyState);
			}
		};

	    xhttp.open("POST", "/getMobileById/removeComment", true);
		xhttp.setRequestHeader("Content-type", "application/json");
		let myData = {};
		myData.postId = postId;
		xhttp.send(JSON.stringify(myData));
	}else{
		alert("No access!");
	}
}