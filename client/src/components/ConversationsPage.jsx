/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
import React from 'react';

class ConversationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      socketInfo: Qs.parse(window.location.search, { ignoreQueryPrefix: true }),
      currentPhrase: 0,
      conversation: '',
      conversations: [],
      room: '',
      username: '',
      users: [],
      recording: false,
      typing: false,
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
      this.setState({ username: socketInfo.username });
      if (error) {
        window.alert(error);
        window.location.href = '/';
      }
    });

    socket.on('welcomeMessage', (conversation, chats) => {
      const promise = new Promise((resolve) => {
        this.setState({
          conversations: [
            ...chats,
            {
              username: conversation.username,
              createdAt: conversation.createdAt,
              text: conversation.text,
              color: conversation.color,
              id: conversation.id
            }
          ]
        });
        resolve(true);
      });
      promise.then(() => {
        const $conversations = document.getElementsByClassName('chat__messages');
        $conversations[0].scrollTop = $conversations[0].scrollHeight;
      });
    });

    socket.on('conversation', (conversation) => {
      const { conversations } = this.state;
      this.setState({
        conversations: [...conversations, {
          username: conversation.username,
          createdAt: conversation.createdAt,
          text: conversation.text,
          color: conversation.color,
          id: conversation.id,
          lastMutation: conversation.lastMutation
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
      const { speakButton, recognition } = this.state;
      const stop = () => {
        recognition.stop();
        speakButton.textContent = '🎙';
        speakButton.classList.remove('speaking');
        this.setState(() => {
          const { socket, username } = this.state;
          socket.emit('recording', { username, recording: false });
          return { recording: false, currentPhrase: 0 };
        });
      };

      const start = () => {
        recognition.start();
        speakButton.textContent = 'Stop speech';
        speakButton.classList.add('speaking');
        this.setState(() => {
          const { socket, username } = this.state;
          socket.emit('recording', { username, recording: true });
          return { recording: true, currentPhrase: 0 };
        });
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
          const { socket, username } = this.state;
          socket.emit('sendConversation', { username, text: speechToText }, (conversation) => (
            conversation
              ? console.log(conversation)
              : console.log('The conversation was delivered successfully!')));
          speechToText = '';
        });
      };

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.addEventListener('result', onResult);
      speakButton.addEventListener('click', () => {
        const { recording } = this.state;
        return recording ? stop() : start();
      });
    });
  }

  onChangeHandler(event) {
    const typingPromise = new Promise((resolve) => {
      this.setState({ conversation: event.target.value });
      resolve(true);
    });
    typingPromise.then(() => {
      const { socket, conversation, username } = this.state;
      if (conversation !== '') {
        socket.emit('typing', { username, typing: true });
      } else {
        socket.emit('typing', { username, typing: false });
      }
    });
  }

  onSubmitHandler(event) {
    const { conversation, socket, username } = this.state;
    event.preventDefault();

    const formInput = event.target[0];
    const submitButton = event.target[1];

    submitButton.setAttribute('disabled', 'disabled');

    socket.emit('sendConversation', { username, text: conversation }, (msg) => {
      submitButton.removeAttribute('disabled');
      formInput.focus();
      return msg ? console.log(msg) : console.log('The conversation was delivered successfully!');
    });

    socket.emit('typing', { username, typing: false });

    this.setState({ conversation: '' });
  }

  onSpeakHandler(event) {
    event.preventDefault();
  }

  onClickTextToSpeech(event) {
    const theElement = event.target.parentNode.parentNode.firstChild;
    const toSay = event.target.parentNode.parentNode.firstChild.textContent.trim();
    const utterance = new SpeechSynthesisUtterance(toSay);

    utterance.addEventListener('start', () => {
      theElement.classList.add('speaking');
    });

    utterance.addEventListener('end', () => {
      theElement.addEventListener('animationiteration', () => theElement.classList.remove('speaking'), { once: true });
    });

    speechSynthesis.speak(utterance);
  }

  autoScroll() {
    const $conversations = document.getElementsByClassName('chat__messages');
    const $newConversation = $conversations[0].lastElementChild;
    // height of new conversation:
    const newMessageStyle = getComputedStyle($newConversation);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom, 10);
    const newMessageHeight = $newConversation.offsetHeight + newMessageMargin;
    // visible height:
    const visibleHeight = $conversations[0].offsetHeight;
    // height of conversations container:
    const containerHeight = $conversations[0].scrollHeight;
    // how far have I scrolled:
    const scrollOffset = $conversations[0].scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset) {
      $conversations[0].scrollTop = $conversations[0].scrollHeight;
    }
  }

  render() {
    const {
      users, conversations, conversation, room
    } = this.state;

    return (
      <div>
        <div className="topbar">Demo for &ava</div>
        <div className="chat">
          <div className="chat__sidebar">
            <h2 className="room-title">
              <p style={{ 'text-align': 'center', 'font-size': '35px' }}>Chat room:</p>
              <p style={{ 'text-align': 'center', 'font-size': '24px' }}>{room}</p>
            </h2>
            <h3 className="list-title">Users:</h3>
            <ul className="users">
              {users.map((user) => {
                if (user.recording) {
                  return (
                    <li style={{ 'font-size': '24px' }}>
                      {`${user.username} `}
                      <span role="img" aria-labelledby="speaking"> 🗣</span>
                    </li>
                  );
                }
                if (user.typing) {
                  return (
                    <li>
                      {`${user.username} `}
                      <span role="img" aria-labelledby="typing">💬</span>
                    </li>
                  );
                }
                return <li style={{ color: `${user.color}` }}>{user.username}</li>;
              })}
            </ul>
          </div>
          <div className="chat__main">
            <div className="chat__messages">
              {
                conversations.map((msg, index) => {
                  let conversationText;
                  const time = moment(msg.createdAt).format('h:mm a');
                  if (msg.username === '') return;
                  if (msg.username === 'Admin') {
                    conversationText = (
                      <div>
                        <p>
                          <span className="message__name">{msg.username}</span>
                          <span className="message__meta">{time}</span>
                        </p>
                        <p>
                          {msg.text}
                        </p>
                      </div>
                    );
                  } else if (index >= 1 && msg.username === conversations[index - 1].username) {
                    conversationText = (
                      <div
                        style={{ display: 'flex' }}
                      >
                        <div>
                          <textarea
                            rows="5"
                            cols="50"
                            wrap="soft"
                            style={{ 'font-size': '25px', color: `${msg.color}` }}
                          >
                            {msg.text}
                          </textarea>
                        </div>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        >
                          <input type="submit" value="⭐️" />
                          <input type="submit" value="🔊" onClick={this.onClickTextToSpeech} />
                          <input type="submit" value="❌" />
                        </div>
                      </div>
                    );
                  } else {
                    conversationText = (
                      <div>
                        <p>
                          <span className="message__name">{msg.username}</span>
                          <span className="message__meta">{time}</span>
                        </p>
                        <div
                          style={{ display: 'flex' }}
                        >
                          <div>
                            <textarea
                              rows="5"
                              cols="50"
                              wrap="soft"
                              style={{ 'font-size': '25px', color: `${msg.color}` }}
                            >
                              {msg.text}
                            </textarea>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          >
                            <input type="submit" value="⭐️" />
                            <input type="submit" value="🔊" onClick={this.onClickTextToSpeech} />
                            <input type="submit" value="❌" />
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      className="conversation"
                      style={{ color: `${msg.color}` }}
                    >
                      {conversationText}
                    </div>
                  );
                })
              }
            </div>
            <div className="compose">
              <form onSubmit={this.onSubmitHandler}>
                <input
                  type="text"
                  placeholder="Type new conversation here"
                  value={conversation}
                  onChange={this.onChangeHandler}
                  required
                  autoComplete="off"
                />
                <button type="submit">Submit new conversation ✉️</button>
              </form>
              <form onSubmit={this.onSpeakHandler}>
                <button id="speakButton" type="submit">Speech-to-text 🎙</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ConversationsPage;
