import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import Store from './shared/Store';

import Home from './views/Home';
import Recipes from './views/Recipes';
import Recipe from './views/Recipe';
import GroceryList from './views/GroceryList';
import Sync from './views/Sync';
import SyncFrom from './views/SyncFrom';
import MealPlan from './views/MealPlan';

class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      collapsed: true
    };

    this.importEl = React.createRef();
  }

  download = (ev) => {
    ev.preventDefault();
    const blob = new Blob([JSON.stringify({
      recipes: Store.get('recipes'),
      list: Store.get('list'),
      plan: Store.get('plan'),
      version: 1
    })], {type: 'application/json'});
    const el = document.createElement('a');
    el.setAttribute('href', URL.createObjectURL(blob));
    el.setAttribute('download', 'my.ktcn');        
    document.body.appendChild(el);
    el.click();        
    document.body.removeChild(el);
  };

  import = (ev) => {
    ev.preventDefault();
    this.importEl.current.click();
  };

  fileChange = (ev) => {
    const file = ev.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (evt) => {
        try {
          let fileData = JSON.parse(evt.target.result);
          for (let i in fileData) {
            if (i === 'version') continue;
            Store.set(i, fileData[i]);
          }
          window.location.reload();
        } catch (e) {
          console.error('Import Error', e);
        }
      };
      reader.onerror = (evt) => {
        console.error('Import Error');
      };
    }
  };

  render() {
    let { collapsed } = this.state;

    return (<div className='app'>
      <header>

        <nav className='navbar navbar-expand-md navbar-light bg-light'>
          <button className='navbar-toggler' type='button' aria-label='Toggle navigation' onClick={() => this.setState({collapsed: !collapsed})}>
            <span className='navbar-toggler-icon'></span>
          </button>

          <Link className='navbar-brand' to='/'>Open Kitchen</Link>

          <div className={'collapse navbar-collapse' + (collapsed ? '' : ' show')}>
            <ul className='navbar-nav mr-auto mt-2 mt-md-0'>
              <li className='nav-item'>
                <Link className='nav-link' to='/recipes'>Recipes</Link>
              </li>
              <li className='nav-item'>
                <Link className='nav-link' to='/groceryList'>Grocery List</Link>
              </li>
              <li className='nav-item'>
                <Link className='nav-link' to='/mealPlan'>Meal Plan</Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      <Switch>
        <Route path='/groceryList' component={GroceryList} />
        <Route path='/recipe/:id' component={Recipe} />
        <Route exact path='/recipes' component={Recipes} />
        <Route exact path='/sync' component={Sync} />
        <Route path='/sync/:id' component={SyncFrom} />
        <Route path='/mealPlan' component={MealPlan} />
        <Route component={Home} />
      </Switch>
      <footer className='container text-center py-3'>
        <hr />
        <div className='my-2'><a href='#download' onClick={this.download}>Download File</a> &middot; <a href='#import' onClick={this.import}>Import From File</a> &middot; <Link to='/sync'>Sync To Device</Link></div>
        <input type='file' className='d-none' ref={this.importEl} accept='.ktcn,application/json' onChange={this.fileChange}/>
        <div>
          MIT &copy; 2019 Russell Steadman. Made with <span role='img' aria-label='Heart'>&#x2764;&#xFE0F;</span> for my mama.
        </div>
      </footer>
    </div>);
  };
}

export default App;
