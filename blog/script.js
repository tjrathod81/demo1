// SIGNUP
const form = document.getElementById("signupForm");

if(form){
form.addEventListener("submit", function(e){
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorMsg = document.getElementById("error-msg");

    if(username === "" || password === "" || confirmPassword === ""){
        errorMsg.textContent = "All fields are required!";
        return;
    }

    if(password !== confirmPassword){
        errorMsg.textContent = "Passwords do not match!";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if(users.find(u => u.username === username)){
        errorMsg.textContent = "Username already exists!";
        return;
    }

    users.push({username, password});
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    window.location.href = "home.html";
});
}


// ================= POSTS =================
let posts = JSON.parse(localStorage.getItem("posts")) || [];

function save(){
    localStorage.setItem("posts", JSON.stringify(posts));
}

const mediaInput = document.getElementById("mediaInput");
const postText = document.getElementById("postText");
const submitPost = document.getElementById("submitPost");

if(submitPost){
    submitPost.addEventListener("click", async () => {
        const textLines = postText.value.split("\n").map(t => t.trim()).filter(t => t !== "");
        const files = mediaInput.files;

        if(textLines.length === 0 && files.length === 0){
            alert("Add something!");
            return;
        }

        // Add text-only posts
        textLines.forEach(t => {
            posts.unshift({ type: "text", text: t });
        });

        // Add files (image/video)
        for(let file of files){
            let reader = new FileReader();
            reader.onload = () => {
                posts.unshift({
                    type: file.type.startsWith("image") ? "image" : "video",
                    media: reader.result,
                    text: ""
                });
                save();
                renderPosts(document.getElementById("blogList"));
            };
            reader.readAsDataURL(file);
        }

        save();
        postText.value = "";
        mediaInput.value = "";
        alert("Posts Added!");
    });
}



// ================= RENDER =================
function renderPosts(list){
    if(!list) return;

    list.innerHTML = "";

    posts.forEach((p,i)=>{
        const div = document.createElement("div");
        div.className = list.id;

        if(p.type==="image"){
            let img=document.createElement("img");
            img.src=p.media;
            div.appendChild(img);
        }

        if(p.type==="video"){
            let v=document.createElement("video");
            v.src=p.media;
            v.controls=true;
            div.appendChild(v);
        }

        if(p.text){
            let t=document.createElement("p");
            t.textContent=p.text;
            div.appendChild(t);
        }


        // EDIT PAGE
        if(list.id==="editList"){
            const textArea=document.createElement("textarea");
            textArea.value=p.text||"";
            div.appendChild(textArea);

            const fileInput=document.createElement("input");
            fileInput.type="file";
            fileInput.accept="image/*,video/*";
            div.appendChild(fileInput);

            const btn=document.createElement("button");
            btn.textContent="Save Changes";

            btn.onclick=()=>{
                posts[i].text=textArea.value;

                if(fileInput.files[0]){
                    let r=new FileReader();
                    r.onload=()=>{
                        posts[i].type=fileInput.files[0].type.startsWith("image")?"image":"video";
                        posts[i].media=r.result;
                        save();
                        location.reload();
                    };
                    r.readAsDataURL(fileInput.files[0]);
                    return;
                }

                save();
                location.reload();
            };

            div.appendChild(btn);
        }


        // DELETE PAGE
        if(list.id==="deleteList"){
            const btn=document.createElement("button");
            btn.textContent="Delete";

            btn.onclick=()=>{
                if(confirm("Are you sure?")){
                    posts.splice(i,1);
                    save();
                    location.reload();
                }
            };

            div.appendChild(btn);
        }

        list.appendChild(div);
    });
}

renderPosts(document.getElementById("blogList"));
renderPosts(document.getElementById("editList"));
renderPosts(document.getElementById("deleteList"));