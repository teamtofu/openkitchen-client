import React from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import Store from './../shared/Store';
import Fuse from 'fuse.js';
import GetImage from './../shared/GetImage';
import ImportIng from './../shared/ImportIng';

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
            console.log(msg);

            let recipes = Store.get('recipes') || {};
            msg.createdAt = new Date().getTime();
            msg.id = Math.random().toString(36).split('.')[1];
            recipes[msg.id] = msg;
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

        return (<div className='container'>
            <h1 className='pt-3 pb-2'>My Recipes</h1>
            <div className='input-group my-3'>
                <input aria-label='Recipe URL' placeholder='https://www.example.com/recipe' className='form-control' type='text' value={url} onChange={(ev) => (this.setState({url: ev.target.value}))}/>
                <div className='input-group-append'>
                    <div className='btn btn-dark' onClick={this.fetch}>Fetch</div>
                </div>
            </div>
            <input aria-label='Recipe Search' placeholder='Search your recipes...' className='form-control my-3' type='text' value={search} onChange={(ev) => (this.setState({search: ev.target.value}))}/>
            <div className='row'>
                {(search ? searchResults : Object.values(recipes).reverse()).map((r) => (<div key={r.id} className='col-12 col-sm-6 col-md-4 col-lg-3'>
                    <div className='card'>
                        {r.image && (<img src={GetImage(r.image)} className='card-img-top' alt={r.name} onError={(ev) => ev.target.setAttribute('src', GetImage(r.image, true))}/>)}
                        <div className='card-body'>
                            <h5 className='card-title'>{r.name || 'Recipe'}</h5>
                            <div className='my-2'>
                                {[
                                    ...(r.keywords ? r.keywords.toUpperCase().split(/,?\s+/g).slice(0, 3) : [])
                                ].map((item, key) => <div key={key} className='badge badge-dark mx-1'>{item}</div>)}
                            </div>
                            <div className='card-text small'>{r.description.replace('&nbsp;', '').substr(0, 300) || '' + (r.description.length > 300 ? '...' : '')}</div>
                        </div>
                        <div className='list-group list-group-flush'>
                            <li className='list-group-item'>
                                <Link to={'/recipe/' + r.id + '/' + encodeURIComponent(r.name.toLowerCase().replace(/\s+/g, '-'))} className='btn-link'>
                                    <div className='btn btn-dark btn-block'>
                                        View Recipe
                                    </div>
                                </Link>
                            </li>
                            <li className='list-group-item'>
                                <div className='btn btn-info btn-block' onClick={() => {
                                    ImportIng(r.id);
                                    this.props.history.push('/groceryList');
                                }}>
                                    Add To Groceries
                                </div>    
                            </li>
                            <li className='list-group-item'>
                                <div className='btn btn-danger btn-block' onClick={() => this.deleteRecipe(r.id)}>
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
