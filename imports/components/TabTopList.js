/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { Songs, Users } from '../collections';
import AppStore from '../events/AppStore';

class TabTopList extends Component {
	static propTypes = {
		naustormData: PropTypes.arrayOf(PropTypes.object),
		endWeek: PropTypes.instanceOf(Date),
		startWeek: PropTypes.instanceOf(Date),
	};

	static defaultProps = {
		naustormData: [],
		endWeek: '',
		startWeek: '',
	};

	static getStores() {
		return [AppStore];
	}

	static calculateState() {
		return {
			naustormData: AppStore.getState()['naustormData'],
		};
	}

	componentDidMount() {}

	fallbackImage = (imageUrl, id) => {
		if (imageUrl) {
			return imageUrl;
		}

		return `https://api.adorable.io/avatar/${id}`;
	};

	render() {
		const { startWeek, endWeek, naustormData } = this.props;

		return (
			<section className="tab__body song">
				<div className="container song__container tab__top-list naustorm-section">
					<div>
						<h5 className="tab__top-list__title">
							Top Songs
							<small className="tab__top-list__date">
								{format(startWeek, 'MMM Do')} - {format(endWeek, 'MMM Do')}
							</small>
						</h5>
					</div>
					<div className="tab__top-list__wrapper">
						<ul className="tab__top-list__inner naustorm">
							{naustormData &&
								naustormData.map(item => (
									<li className="tab__top-list__item columns three naustorm-elm" key={item._id}>
										<div className="naustorm-elm__wrapper">
											<img className="naustorm-elm__cover" src={this.fallbackImage(item.thumbURL, item._id)} alt="" />
											<span className="naustorm-elm__listens">
												{item.listens} <small>listings</small>
											</span>
										</div>
										<h6 className="naustorm-elm__title tab__top-list__name">{item.name}</h6>
										<span className="naustorm-elm__artist tab__top-list__artist">{item.artist}</span>
									</li>
								))}
						</ul>
					</div>
				</div>
			</section>
		);
	}
}

export default withTracker(({ currentRoom }) => {
	const today = new Date();
	const startWeek = startOfWeek(today);
	const endWeek = endOfWeek(today);

	// const listenderForNaustorm = Songs.find({ timeAdded: { $gt: today.getTime() } }, { sort: { timeAdded: 1 } });
	const getNaustormData = () => {
		let songList = [];
		const naustorm = [];
		let group = [];
		let groupByAuthor = [];
		const groupByAuthorData = [];

		songList = Songs.find(
			{
				timeAdded: { $gt: startWeek.getTime(), $lt: endWeek.getTime() },
				roomId: currentRoom ? currentRoom._id : null,
			},
			{ sort: { timeAdded: 1 } }
		).fetch();

		group = _.chain(songList)
			.groupBy('name')
			.sortBy(i => -1 * i.length)
			.slice(0, 8);

		groupByAuthor = _.chain(songList).groupBy('author');

		/* eslint-disable */
		for (const item in group._wrapped) {
			const g = group._wrapped[item];
			const t = g[0];
			t.listens = g.length;
			naustorm.push(t);
		}

		for (const item in groupByAuthor._wrapped) {
			const g = groupByAuthor._wrapped[item];
			const t = {
				author: g[0].author.length === 0 ? 'The Many-Faced' : g[0].author,
				books: g.length,
			};

			groupByAuthorData.push(t);
		}

		return {
			naustorm_data: naustorm,
			naustorm_total: songList.length,
			naustorm_author_data: groupByAuthorData,
		};
	};

	const mergeData = naustormData => {
		// const userList = Session.get('naustorm_author_data');
		const userList = naustormData.naustorm_author_data;

		const userDataList = Users.find({}).fetch();
		let newUserList;

		newUserList = userList.map(item => {
			const user = _.find(userDataList, i => i._id === item.author);
			if (user !== undefined) {
				user.books = item.books;
			}

			return user;
		});

		newUserList = _.sortBy(newUserList, i => -1 * (1000 * i.status.online) - (i.balance || 0));

		// Session.set('USER_LIST', newUserList);
		return newUserList;
	};

	const naustormData = getNaustormData();
	const newUserList = mergeData(naustormData);

	return {
		startWeek,
		endWeek,
		naustormData: naustormData.naustorm_data,
	};
})(Container.create(TabTopList));
