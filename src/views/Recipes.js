import React from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import Store from '../shared/Store';
import Fuse from 'fuse.js';
import GetImage from '../shared/GetImage';
import ImportIng from '../shared/ImportIng';
import Classy from '../shared/Classy';

const cx = Classy([]);

const socket = io(process.env.NODE_ENV === 'development' ? process.env.REACT_APP_SOCKET_URL : undefined, {
    autoConnect: false
});

class Recipes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: '',
            recipes: Store.get('recipes') || {},
            search: ''
        };

        window.scrollTo(0, 0);
    }

    componentWillMount() {
        socket.open();
        socket.on('recipe', (msg) => {
            let recipes = Store.get('recipes') || {};
            msg.createdAt = new Date().getTime();
            msg.id = Math.random().toString(36).split('.')[1];
            recipes[msg.id] = {
                ...{
                    '@context': 'http://schema.org',
                    '@type': 'Recipe',
                    cookTime: 'P0Y0M0DT0H0M0.000S',
                    image: 'about:blank',
                    keywords: '',
                    name: '',
                    description: '',
                    prepTime: 'P0Y0M0DT0H0M0.000S',
                    recipeIngredient: [],
                    recipeInstructions: [],
                    totalTime: 'P0Y0M0DT0H0M0.000S'
                },
                ...msg
            };
            Store.set('recipes', recipes);
            this.loadRecipes();
        });

        socket.on('recipeStatus', (error) => {
            this.setState({
                status: error
                    ? 'Unable to fetch recipe using that URL.'
                    : 'All recipes found have been added.'
            });
        });
    }

    componentWillUnmount() {
        socket.close();
    }

    fetch = () => {
        if (!this.state.url) return;
        socket.emit('recipeUrl', this.state.url);
        this.setState({url: ''});
    };

    loadRecipes = () => {
        this.setState({
            recipes: Store.get('recipes') || {}
        });
    };

    deleteRecipe = (id) => {
        let recipes = Store.get('recipes') || {};
        delete recipes[id];
        Store.set('recipes', recipes);
        this.loadRecipes();
    };

    search = (term) => {
        const options = {
            shouldSort: true,
            threshold: 0.6,
            //location: 0,
            distance: 100,
            maxPatternLength: 20,
            minMatchCharLength: 1,
            keys: [
                {
                    name: 'name',
                    weight: 0.7
                },
                {
                    name: 'description',
                    weight: 0.3
                },
            ]
          };
          const fuse = new Fuse(Object.values(this.state.recipes), options);
          return fuse.search(term.substr(0, 20));
    }

    render() {
        let { url, recipes, search } = this.state;

        let searchResults = [];
        if (search) searchResults = this.search(search);

        return (<div className={cx('container')}>
            <h1 className={cx('pt-3', 'pb-2')}>My Recipes</h1>
            <div className={cx('input-group', 'my-3')}>
                <input aria-label='Recipe URL' placeholder='https://www.example.com/recipe' className={cx('form-control')} type='text' value={url} onChange={(ev) => (this.setState({url: ev.target.value}))}/>
                <div className={cx('input-group-append')}>
                    <div className={cx('btn', 'btn-dark')} onClick={this.fetch}>Fetch</div>
                </div>
            </div>
            <input aria-label='Recipe Search' placeholder='Search your recipes...' className={cx('form-control', 'my-3')} type='text' value={search} onChange={(ev) => (this.setState({search: ev.target.value}))}/>
            <div className={cx('row')}>
                {(search ? searchResults : Object.values(recipes).reverse()).map((r) => (<div key={r.id} className={cx('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3')}>
                    <div className={cx('card')}>
                        {r.image && (<img src={GetImage(r.image)} className={cx('card-img-top')} alt={r.name} onError={(ev) => ev.target.setAttribute('src', GetImage(r.image, true))}/>)}
                        <div className={cx('card-body')}>
                            <h5 className={cx('card-title')}>{r.name || 'Recipe'}</h5>
                            <div className={cx('my-2')}>
                                {[
                                    ...(r.keywords ? r.keywords.toUpperCase().split(',').slice(0, 3) : [])
                                ].map((item, key) => <div key={key} className={cx('badge', 'badge-dark', 'mx-1')}>{item.trim()}</div>)}
                            </div>
                            <div className={cx('card-text', 'small')}>{r.description.replace('&nbsp;', '').substr(0, 300) || '' + (r.description.length > 300 ? '...' : '')}</div>
                        </div>
                        <div className={cx('list-group', 'list-group-flush')}>
                            <li className={cx('list-group-item')}>
                                <Link to={'/recipe/' + r.id + '/' + encodeURIComponent(r.name.toLowerCase().replace(/\s+/g, '-'))} className={cx('btn-link')}>
                                    <div className={cx('btn', 'btn-dark', 'btn-block')}>
                                        View Recipe
                                    </div>
                                </Link>
                            </li>
                            <li className={cx('list-group-item')}>
                                <div className={cx('btn', 'btn-info', 'btn-block')} onClick={() => {
                                    ImportIng(r.id);
                                    this.props.history.push('/grocery-list');
                                }}>
                                    Add To Groceries
                                </div>    
                            </li>
                            <li className={cx('list-group-item')}>
                                <div className={cx('btn', 'btn-danger', 'btn-block')} onClick={() => this.deleteRecipe(r.id)}>
                                    Delete
                                </div>    
                            </li>
                        </div>
                    </div>
                </div>))}
            </div>
        </div>)
    };
}

export default Recipes;
