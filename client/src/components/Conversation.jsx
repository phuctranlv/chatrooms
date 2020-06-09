/* eslint-disable react/prop-types */
/* eslint-disable class-methods-use-this */
import React from 'react';

class Conversation extends React.Component {
  constructor({ socket, username, conversation }) {
    super(socket, username, conversation);
    this.state = {
      conversation,
      cursorLocation: 0
    };
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onClickTextToSpeech = this.onClickTextToSpeech.bind(this);
    this.onClickDeleteHandler = this.onClickDeleteHandler.bind(this);
    this.onClickFavoriteHandler = this.onClickFavoriteHandler.bind(this);

    socket.on('editing', (convo) => {
      const { conversation } = this.state;
      if (conversation.id === convo.id) {
        this.setState({ conversation: convo });
      }
    });
  }

  onChangeHandler(event) {
    const { conversation } = this.state;
    const copyOfConversation = { ...conversation };
    copyOfConversation.text = event.target.value;
    const typingPromise = new Promise((resolve) => {
      this.setState({ conversation: copyOfConversation });
      resolve(true);
    });
    typingPromise.then(() => {
      const { socket, username } = this.props;
      socket.emit('editing', { username, copyOfConversation });
    });
  }

  onClickDeleteHandler(event) {
    const { socket, username } = this.props;
    const { id } = event.target.parentNode.parentNode.firstChild.firstChild;
    socket.emit('deleteConversation', { username, id }, (error) => {
      if (error) return console.log(error);
      console.log('The conversation is successfully deleted');
    });
  }

  onClickFavoriteHandler(event) {
    const favorite = event.target.parentNode.parentNode.firstChild;
    if (favorite.classList[0]) return favorite.classList.remove('favorite');
    favorite.classList.add('favorite');
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

  render() {
    const { conversation } = this.state;
    let conversationText;
    const parsedTime = parseInt(conversation.createdat, 10);
    const time = moment(parsedTime).format('h:mm a');
    if (conversation.username === '') return null;
    if (conversation.username === 'Admin') {
      conversationText = (
        <div>
          <p>
            <span className="message__name">{conversation.username}</span>
            <span className="message__meta">{time}</span>
          </p>
          <p>
            {conversation.text}
          </p>
        </div>
      );
    } else {
      conversationText = (
        <div>
          <p>
            <span className="message__name">{conversation.username}</span>
            <span className="message__meta">{time}</span>
          </p>
          <div
            style={{ display: 'flex' }}
          >
            <div>
              <textarea
                id={conversation.id}
                onChange={this.onChangeHandler}
                rows="5"
                cols="50"
                wrap="soft"
                style={{ 'font-size': '25px', color: `${conversation.color}` }}
                value={conversation.text}
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}
            >
              <input
                onClick={this.onClickFavoriteHandler}
                type="submit"
                className="action-button"
                value="⭐️"
              />
              <input
                type="submit"
                className="action-button"
                value="🔊"
                onClick={this.onClickTextToSpeech}
              />
              <input
                onClick={this.onClickDeleteHandler}
                type="submit"
                className="action-button"
                value="❌"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="conversation"
        style={{ color: `${conversation.color}` }}
      >
        {conversationText}
      </div>
    );
  }
}

export default Conversation;
