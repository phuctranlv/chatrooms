/* eslint-disable react/prop-types */
/* eslint-disable class-methods-use-this */
import React from 'react';

class Conversation extends React.Component {
  constructor({ socket, username, conversation }) {
    super({ socket, username, conversation });
    this.state = {
      socket,
      username,
      conversation
    };
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onClickTextToSpeech = this.onClickTextToSpeech.bind(this);
    this.onClickDeleteHandler = this.onClickDeleteHandler.bind(this);
    this.onClickFavoriteHandler = this.onClickFavoriteHandler.bind(this);
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

    socket.emit('sendConversation', { username, text: conversation }, (conversation) => {
      submitButton.removeAttribute('disabled');
      formInput.focus();
      return conversation ? console.log(conversation) : console.log('The conversation was delivered successfully!');
    });

    socket.emit('typing', { username, typing: false });

    this.setState({ conversation: '' });
  }

  onClickDeleteHandler(event) {
    const { socket, username } = this.state;
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
                rows="5"
                cols="50"
                wrap="soft"
                style={{ 'font-size': '25px', color: `${conversation.color}` }}
              >
                {conversation.text}
              </textarea>
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
