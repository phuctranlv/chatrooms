/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      socketInfo: Qs.parse(window.location.search, { ignoreQueryPrefix: true }),
      currentPhrase: 0,
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
    this.onClickTextToSpeech = this.onClickTextToSpeech.bind(this);

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
        speakButton.textContent = '🎙';
        speakButton.classList.remove('speaking');
        this.setState({ listening: false, currentPhrase: 0 });
      };

      const start = () => {
        recognition.start();
        speakButton.textContent = 'Stop speech';
        speakButton.classList.add('speaking');
        this.setState({ listening: true, currentPhrase: 0 });
      };

      const onResult = (event) => {
        let speechToText = '';

        const speechUpdatePromise = new Promise((resolve) => {
          const { currentPhrase } = this.state;
          const arrayOfSpeech = Array.from((event.results));
          let i = 0;

          for (i = currentPhrase; i < arrayOfSpeech.length; i += 1) {
            speechToText = `${speechToText + arrayOfSpeech[i][0].transcript} `;
          }

          if (arrayOfSpeech[i - 1].isFinal) {
            this.setState({ currentPhrase: i });
            resolve(true);
          }
        });

        speechUpdatePromise.then(() => {
          socket.emit('sendMessage', speechToText, (message) => (
            message
              ? console.log(message)
              : console.log('The message was delivered successfully!')));
          speechToText = '';
        });
      };

      recognition.continuous = true;
      recognition.interimResults = true;
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

  onClickTextToSpeech(event) {
    const toSay = event.target.textContent.trim();
    const utterance = new SpeechSynthesisUtterance(toSay);
    speechSynthesis.speak(utterance);
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
              messages.map((msg, index) => {
                let messageText;
                if (index >= 1 && msg.username === messages[index - 1].username) {
                  messageText = (
                    <div>
                      <p
                        className="message__text"
                        onClick={this.onClickTextToSpeech}
                      >
                        {msg.message}
                      </p>
                    </div>
                  );
                } else {
                  messageText = (
                    <div>
                      <p>
                        <span className="message__name">{msg.username}</span>
                        <span className="message__meta">{msg.createdAt}</span>
                      </p>
                      <p
                        className="message__text"
                        onClick={this.onClickTextToSpeech}
                      >
                        {msg.message}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="message">{messageText}</div>
                );
              })
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
              <button id="speakButton" type="submit">🎙</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
