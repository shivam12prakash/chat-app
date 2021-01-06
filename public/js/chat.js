const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#Send-location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMeassgeTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
      // New message element
      const $newMessage = $messages.lastElementChild

      // Height of the new message
      const newMessageStyles = getComputedStyle($newMessage)
      const newMessageMargin = parseInt(newMessageStyles.marginBottom)
      const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  
      // Visible height
      const visibleHeight = $messages.offsetHeight
  
      // Height of messages container
      const containerHeight = $messages.scrollHeight
  
      // How far have I scrolled?
      const scrollOffset = $messages.scrollTop + visibleHeight
  
      if (containerHeight - newMessageHeight <= scrollOffset) {
          $messages.scrollTop = $messages.scrollHeight
      }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMeassgeTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error)
        {
            return console.log(error)
        }
        console.log('Messgae Delivered')
    })
})

$sendLocationButton.addEventListener('click', ()=> {
    if(!navigator.geolocation)
    {
        return alert('Your browser does not support Geolocation')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Loaction Shared Successfully')

        })
    })
})

socket.emit('join', { username, room}, (error) => {
    if (error) {
        alert('error')
        location.href = '/'
    }

}) // it accepts the username and room that we are willing to join