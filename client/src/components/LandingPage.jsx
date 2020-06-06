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
      showModal: true
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
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
      <div onClick={this.handleOpenModal}>
        <LogInModal
          show={showModal}
          handleClose={this.handleCloseModal}
          handleOpen={this.handleOpenModal}
        />
        <div>
          <div className="topbar">Demo for & ava</div>
          <div className="chat">
            <div className="chat__sidebar">
              <h2 className="room-title">
                <p style={{ 'text-align': 'center', 'font-size': '35px' }}>Welcome to ava!</p>
              </h2>
            </div>
            <div
              className="chat__main"
              style={{
                'text-align': 'center',
                'font-size': '35px',
                'justify-content': 'center',
                'align-items': 'center'
              }}
            >
              Click anywhere on the page to log-in and join the conversations!
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LandingPage;
