/* eslint-disable react/prop-types */
import React from 'react';
import styles from '../styles/LogInModal.css';

const SignInModal = (props) => {
  const { show, handleClose } = props;
  const showHideClassname = show === true ? `${styles.modal} ${styles.displayBlock}` : `${styles.modal} ${styles.displayNone}`;

  return (
    <div onClick={event => event.stopPropagation()} >
      <div className={showHideClassname} onClick={handleClose}>
        <section className={styles.modalMain} onClick={event => event.stopPropagation()}>
          <div className="centered-form">
            <div className="centered-form__box">
              <h1>Join</h1>
              <form action="/chat.html">
                <label>Display name</label>
                <input type="text" name="username" placeholder="Display name" required />
                <label>Room</label>
                <input type="text" name="room" placeholder="Room" required />
                <button className="button" type="submit" value="Join">Join</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SignInModal;
