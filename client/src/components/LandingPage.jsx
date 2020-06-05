/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
import React from 'react';
import LogInModal from './LogInModal.jsx';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      room: '',
      showModal: false
    };
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }


  componentDidMount() {
  }

  onChangeHandler(event) {
  }

  onSubmitHandler(event) {
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    const {
      messages, room, showModal
    } = this.state;

    return (
      <div>
        <LogInModal
          show={showModal}
          handleClose={this.handleCloseModal}
          handleOpen={this.handleOpenModal}
        />
        <div>
          <div className="topbar" onClick={this.handleOpenModal}>Demo for & ava</div>
          <div className="chat">
            <div className="chat__sidebar">
              <h2 className="room-title">
                <p style={{ 'text-align': 'center', 'font-size': '35px' }}>Welcome to ava!</p>
              </h2>
            </div>
            <div className="chat__main">
              <div className="chat__messages">
                {
                  messages.map((msg) => {
                    const messageText = (
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

                    return (
                      <div
                        className="message"
                        style={{ color: `${msg.color}` }}
                      >
                        {messageText}
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LandingPage;
