const socket = io(); 

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");


//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room }  = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
}

socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
})

socket.on("locationMessage", (data) => {
    console.log(data.url);
    var html = Mustache.render(locationTemplate, {
        url: data.url,
        username: data.username,
        createdAt: moment(data.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
})

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector("#sidebar").innerHTML = html;
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // disable the form 
    $messageFormButton.setAttribute("disabled", "disabled");

    var msg = e.target.elements.message.value;

    socket.emit("sendMessage", msg, (error) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if(error) {
            return console.log(error);
        }
        //re enable the form
        console.log("Message delivered");
    });
});

$locationButton.addEventListener("click", () => {
    if(!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }
    $locationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit("sendLocation", coords, () => {
            $locationButton.removeAttribute("disabled");
            console.log("Location shared");
        });
    })
})


socket.emit("join", {username, room}, (error) => {
    if(error)
        alert(error)
    location.href = "/";
});