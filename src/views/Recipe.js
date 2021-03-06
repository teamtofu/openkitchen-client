import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import './Recipe.scss';
import Store from './../shared/Store';
import GetImage from './../shared/GetImage';
import ImportIng from '../shared/ImportIng';
import Classy from '../shared/Classy';

const cx = Classy([]);

class Recipe extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            recipe: (Store.get('recipes') || {})[props.match.params.id],
            highlight: null
        };

        window.scrollTo(0, 0);
    }

    deleteRecipe = () => {
        let recipes = Store.get('recipes') || {};
        delete recipes[this.state.recipe.id];
        Store.set('recipes', recipes);
        this.setState({recipe: null});
    };

    importIng = () => {
        ImportIng(this.state.recipe.id);
        this.props.history.push('/grocery-list');
    };

    render() {
        let { recipe } = this.state;

        if (!recipe) return <Redirect to='/recipes'/>;

        return (<div>
            <div className={cx('jumbotron', 'text-center', 'recipe-bg')} style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${GetImage(recipe.image)})`}}>
                <h1 className={cx('my-2')}>{recipe.name}</h1>
            </div>
            <div className={cx('container')}>
                <Link to='/recipes' className={cx('btn-link')}><div className={cx('btn', 'btn-outline-dark', 'btn-block')}>Return to Recipes</div></Link>
                <div className={cx('my-2')}>
                    {[
                        ...(recipe.keywords ? recipe.keywords.toUpperCase().split(',').slice(0, 3) : [])
                    ].map((item, key) => <div key={key} className={cx('badge', 'badge-dark', 'mx-1')}>{item.trim()}</div>)}
                </div>
                {recipe.description && (<div className={cx('my-2')}>
                    {recipe.description}
                </div>)}
                {recipe.recipeIngredient && (<div className={cx('my-2')}>
                    <h3>Ingredients</h3>
                    <ul className={cx('list-group')}>
                        {recipe.recipeIngredient.map((ing, key) => (<li key={key} className={cx('list-group-item', 'py-1', 'small')}>{ing}</li>))}
                    </ul>
                    <div className={cx('btn', 'btn-info', 'btn-block', 'my-2')} onClick={this.importIng}>Add to Groceries</div>
                </div>)}
                {recipe.recipeInstructions && (<div className={cx('my-2')}>
                    <h3>Instructions</h3>
                    {[...(recipe.recipeInstructions[0]['@type'] === 'HowToSection' ? recipe.recipeInstructions : [recipe.recipeInstructions])].map((instSet, key) => (<ul className={cx('list-group', 'my-2')} key={key}>
                        {instSet.name && <li className={cx('list-group-item', 'list-group-item-secondary')}>{instSet.name}</li>}
                        {(instSet.itemListElement || instSet).map((step, key) => (<li key={key} className={cx('list-group-item', 'instruction', 'py-2', {'step-highlight': this.state.highlight === key})} onClick={() => this.setState({highlight: key})}>{typeof step === 'object' ? step.text : step}</li>))}
                    </ul>))}
                </div>)}
                <a href={recipe.url || recipe.mainEntityOfPage || '#link-missing'} target='_blank' rel='noopener noreferrer' className={cx('btn-link')}>
                    <div className={cx('btn', 'btn-outline-info', 'btn-block', 'my-3')}>
                        Original Recipe
                    </div>
                </a>
                <Link to='/recipes' className={cx('btn-link')}>
                    <div className={cx('btn', 'btn-outline-dark', 'btn-block', 'my-3')}>
                        Return to Recipes
                    </div>
                </Link>
                <div className={cx('btn', 'btn-outline-danger', 'btn-block', 'my-3')} onClick={this.deleteRecipe}>
                    Delete Recipe
                </div>
            </div>
        </div>)
    };
}

export default Recipe;
