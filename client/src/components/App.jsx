/* eslint-disable class-methods-use-this */
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      socketInfo: Qs.parse(window.location.search, { ignoreQueryPrefix: true }),
      message: '',
      messages: [],
      room: '',
      users: [],
      listening: false,
      speakButton: '',
      recognition: window.SpeechRecognition
        ? new window.SpeechRecognition()
        : new window.webkitSpeechRecognition()
    };
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.autoScroll = this.autoScroll.bind(this);
    this.onSpeakHandler = this.onSpeakHandler.bind(this);

    const { socket, socketInfo } = this.state;

    socket.emit('join', socketInfo, (error) => {
      if (error) {
        window.alert(error);
        window.location.href = '/';
      }
    });

    socket.on('message', (message) => {
      const { messages } = this.state;
      this.setState({
        messages: [...messages, {
          username: message.username,
          createdAt: moment(message.createdAt).format('h:mm a'),
          message: message.text
        }]
      });
      this.autoScroll();
    });

    socket.on('roomData', ({ room, users }) => this.setState({ room, users }));
  }


  componentDidMount() {
    const promise = new Promise((resolve) => {
      resolve(true);
      this.setState({ speakButton: document.getElementById('speakButton') });
    });

    promise.then(() => {
      const { speakButton, recognition, socket } = this.state;
      const stop = () => {
        recognition.stop();
        speakButton.textContent = 'Start speech';
        speakButton.classList.remove('speaking');
        this.setState({ listening: false });
      };

      const start = () => {
        recognition.start();
        speakButton.textContent = 'Stop speech';
        speakButton.classList.add('speaking');
        this.setState({ listening: true });
      };

      const onResult = (event) => {
        let speechToText = '';

        for (const res of event.results) {
          speechToText = `${speechToText + res[0].transcript} `;

          if (res.isFinal) {
            socket.emit('sendMessage', speechToText, (message) => (
              message
                ? console.log(message)
                : console.log('The message was delivered successfully!')));
            speechToText = '';
          }
        }

        stop();
      };

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.addEventListener('result', onResult);
      speakButton.addEventListener('click', () => {
        const { listening } = this.state;
        return listening ? stop() : start();
      });
    });
  }

  onChangeHandler(event) {
    this.setState({ message: event.target.value });
  }

  onSubmitHandler(event) {
    const { message, socket } = this.state;
    event.preventDefault();

    const formInput = event.target[0];
    const submitButton = event.target[1];

    submitButton.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', message, (msg) => {
      submitButton.removeAttribute('disabled');
      formInput.focus();
      return msg ? console.log(msg) : console.log('The message was delivered successfully!');
    });

    this.setState({ message: '' });
  }

  onSpeakHandler(event) {
    event.preventDefault();
  }

  autoScroll() {
    const $messages = document.getElementsByClassName('chat__messages');
    const $newMessage = $messages[0].lastElementChild;
    // height of new message:
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom, 10);
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
    const {
      users, messages, message, room
    } = this.state;

    return (
      <div className="chat">
        <div className="chat__sidebar">
          <h2 className="room-title">
            <p>Chat room:</p>
            <p>{room}</p>
          </h2>
          <h3 className="list-title">Users:</h3>
          <ul className="users">
            {users.map((user) => <li>{user.username}</li>)}
          </ul>
        </div>
        <div className="chat__main">
          <div className="chat__messages">
            {
              messages.map((msg) => (
                <div className="message">
                  <p>
                    <span className="message__name">{msg.username}</span>
                    <span className="message__meta">{msg.createdAt}</span>
                  </p>
                  <p>{msg.message}</p>
                </div>
              ))
            }
          </div>
          <div className="compose">
            <form onSubmit={this.onSubmitHandler}>
              <input
                type="text"
                placeholder="Type text here"
                value={message}
                onChange={this.onChangeHandler}
                required
                autoComplete="off"
              />
              <button type="submit">Submit text</button>
            </form>
            <form onSubmit={this.onSpeakHandler}>
              <button id="speakButton" type="submit">Start speech</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
