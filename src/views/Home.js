import React from 'react';
import { Link } from 'react-router-dom';

class Home extends React.Component {
    render() {
        const hour = new Date().getHours();

        return (<div className='container'>
            <h2 className='my-2'>{hour < 12 ? 'Good morning!' : hour < 17 ? 'Good afternoon!' : 'Good Evening!'} Let's get cooking.</h2>
            <div className='row py-3'>
                <div className='col-12 col-sm-6 col-md-4 col-lg-3'>
                    <div className='card'>
                        <div className='card-body'>
                            <h5 className='card-title'>Grab a Recipe</h5>
                            <p className='card-text'>Quickly add recipes by copying a link to the recipe and pasting it.</p>
                            <Link to='/recipes'>Add a recipe</Link>
                        </div>
                    </div>
                </div>
                <div className='col-12 col-sm-6 col-md-4 col-lg-3'>
                    <div className='card'>
                        <div className='card-body'>
                            <h5 className='card-title'>Make a Grocery List</h5>
                            <p className='card-text'>Add items individually or import all of the ingredients from your favorite recipes.</p>
                            <Link to='/groceryList'>Add an ingredient</Link>
                        </div>
                    </div>
                </div>
                <div className='col-12 col-sm-6 col-md-4 col-lg-3'>
                    <div className='card'>
                        <div className='card-body'>
                            <h5 className='card-title'>Plan Your Meals</h5>
                            <p className='card-text'>Know what to buy and make ahead of time with this simple meal planner.</p>
                            <Link to='/mealPlan'>Make your schedule</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
    };
}

export default Home;
