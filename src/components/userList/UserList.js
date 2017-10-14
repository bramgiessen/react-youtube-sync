// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './UserList.css'

export default class UserList extends Component {
	static propTypes = {
		users: PropTypes.array.isRequired,
	}

	render () {
		const { users } = this.props

		const usersInList = users.map ( ( user, index ) => {
			return (
				<div className="user" key={index}>
					<span className="user-name">{user.userName}</span>
				</div>
			)
		} )

		return (
			<div className="users-in-party-list">
				<h2 className="title">Users in party</h2>
				{usersInList}
			</div>
		)
	}
}