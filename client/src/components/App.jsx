import React from 'react';
import styles from '../styles/App.css';

const socket = io();
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [],
      room: '',
      users: [],
      listening: false,
      speakButton: '',
      recognition: ''
    }
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.autoScroll = this.autoScroll.bind(this);
    this.onSpeakHandler = this.onSpeakHandler.bind(this);

    socket.emit('join', { username, room }, (error) => {
      if (error) {
        alert(error);
        location.href = '/';
      };
    });

    socket.on('message', (message) => {
      this.setState({
        messages: [...this.state.messages, {
          username: message.username,
          createdAt: moment(message.createdAt).format('h:mm a'),
          message: message.text
        }]
      });
      this.autoScroll();
    });

    socket.on('roomData', ({ room, users }) => {
      this.setState({ room, users })
    })
  }

  componentDidMount() {
    this.state.speakButton = document.getElementById('speakButton');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (typeof SpeechRecognition !== "undefined") {
      this.state.recognition = new SpeechRecognition();

      const stop = () => {
        this.state.recognition.stop();
        this.state.speakButton.textContent = "Start speech";
        this.state.speakButton.classList.remove("speaking")
        this.setState({ listening: false })
      };

      const start = () => {
        this.state.recognition.start();
        this.state.speakButton.textContent = "Stop speech";
        this.state.speakButton.classList.add("speaking")
        this.setState({ listening: true })
      };

      const onResult = (event) => {
        let speechToText = ''

        for (const res of event.results) {
          speechToText = speechToText + res[0].transcript + ' ';

          if (res.isFinal) {
            socket.emit('sendMessage', speechToText, (message) => {
              message ? console.log(message) : console.log('The message was delivered successfully!');
            })
            speechToText = '';
          }
        }

        stop();
      };

      this.state.recognition.continuous = false;
      this.state.recognition.interimResults = false;
      this.state.recognition.addEventListener("result", onResult);
      this.state.speakButton.addEventListener("click", event => {
        this.state.listening ? stop() : start();
      });
    }
  }

  onChangeHandler(event) {
    this.setState({ message: event.target.value })
  }

  onSubmitHandler(event) {
    event.preventDefault();

    const formInput = event.target[0];
    const submitButton = event.target[1];

    submitButton.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', this.state.message, (message) => {
      submitButton.removeAttribute('disabled');
      formInput.focus();
      message ? console.log(message) : console.log('The message was delivered successfully!');
    })

    this.setState({ message: '' })
  }

  onSpeakHandler(event) {
    event.preventDefault();
  }

  autoScroll() {
    const $messages = document.getElementsByClassName('chat__messages');
    const $newMessage = $messages[0].lastElementChild;
    // height of new message:
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    // visible height:
    const visibleHeight = $messages[0].offsetHeight;
    // height of messages container:
    const containerHeight = $messages[0].scrollHeight;
    // how far have I scrolled:
    const scrollOffset = $messages[0].scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset) {
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }
  }

  render() {
    return (
      <div className="chat">
        <div className="chat__sidebar">
          <h2 className="room-title">
            <p>Chat room:</p>
            <p>{this.state.room}</p>
          </h2>
          <h3 className="list-title">Users:</h3>
          <ul className="users">
            {this.state.users.map((user) => <li>{user.username}</li>)}
          </ul>
        </div>
        <div className="chat__main">
          <div className="chat__messages">
            {
              this.state.messages.map(message => {
                return (
                  <div className="message">
                    <p>
                      <span className="message__name">{message.username}</span>
                      <span className="message__meta">{message.createdAt}</span>
                    </p>
                    <p>{message.message}</p>
                  </div>
                )
              })
            }
          </div>
          <div className="compose">
            <form onSubmit={this.onSubmitHandler}>
              <input
                type="text"
                placeholder="Type text here"
                value={this.state.message}
                onChange={this.onChangeHandler}
                required
                autoComplete="off"
              />
              <button>Submit text</button>
            </form>
            <form onSubmit={this.onSpeakHandler}>
              <button id="speakButton">Start speech</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
