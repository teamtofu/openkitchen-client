import React from 'react';
import { Link } from 'react-router-dom';
import Classy from '../shared/Classy';
import Store from '../shared/Store';

const cx = Classy([]);

class Home extends React.Component {
    render() {
        const today = new Date();
        const hour = today.getHours();
        const plan = Store.get('plan') || {};
        const planToday = plan[`${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`];
        const recipes = Store.get('recipes') || {};

        return (<div className={cx('container')}>
            <h2 className={cx('my-2')}>{hour < 12 ? 'Good morning!' : hour < 17 ? 'Good afternoon!' : 'Good Evening!'} Let's get cooking.</h2>
            <div className={cx('row', 'py-3')}>
                {(planToday && planToday.recipes[0]) && (<div className={cx('col-12')}>
                    <ul className={cx('list-group', 'mb-3')}>
                        <li className={cx('list-group-item', 'list-group-item-secondary')}>On The Menu Today</li>
                        {planToday.recipes.map((recipe, key) => {
                            if (!recipes[recipe]) return null;
                            return (<li className={cx('list-group-item')} key={key}>
                                <Link to={'/recipe/' + recipe}>{recipes[recipe].name}</Link>
                            </li>);
                        })}
                    </ul>
                </div>)}
                <div className={cx('col-12', 'col-sm-6', 'col-md-4')}>
                    <div className={cx('card', 'mb-2')}>
                        <div className={cx('card-body')}>
                            <h5 className={cx('card-title')}>Grab a Recipe</h5>
                            <p className={cx('card-text')}>Quickly add recipes by copying a link to the recipe and pasting it.</p>
                            <Link to='/recipes'>Add a recipe</Link>
                        </div>
                    </div>
                </div>
                <div className={cx('col-12', 'col-sm-6', 'col-md-4')}>
                    <div className={cx('card', 'mb-2')}>
                        <div className={cx('card-body')}>
                            <h5 className={cx('card-title')}>Make a Grocery List</h5>
                            <p className={cx('card-text')}>Add items individually or import all of the ingredients from your favorite recipes.</p>
                            <Link to='/grocery-list'>Add an ingredient</Link>
                        </div>
                    </div>
                </div>
                <div className={cx('col-12', 'col-sm-6', 'col-md-4')}>
                    <div className={cx('card', 'mb-2')}>
                        <div className={cx('card-body')}>
                            <h5 className={cx('card-title')}>Plan Your Meals</h5>
                            <p className={cx('card-text')}>Know what to buy and make ahead of time with this simple meal planner.</p>
                            <Link to='/meal-plan'>Make your schedule</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
    };
}

export default Home;
