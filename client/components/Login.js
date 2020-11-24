import fetch from 'node-fetch';
import React, { Component } from 'react';
import * as s from 'semantic-ui-react';

class Login extends Component {
  constructor(props) {
    super(props);
    this.logIn = this.logIn.bind(this);
  }

  logIn() {
    fetch('/auth/login')
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <div className="ui placeholder segment">
        <div className="ui icon header">
          <i className="search icon"></i>
          Login with Venmo (or some other Oauth)
        </div>
        <div className="inline">
          <s.Button className="ui primary button" onClick={this.logIn}>
            Venmo
          </s.Button>
        </div>
      </div>
    );
  }
}

export default Login;
