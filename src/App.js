import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import Store from './shared/Store';
import Classy from './shared/Classy';

import Home from './views/Home';
import Recipes from './views/Recipes';
import Recipe from './views/Recipe';
import GroceryList from './views/GroceryList';
import Sync from './views/Sync';
import SyncFrom from './views/SyncFrom';
import MealPlan from './views/MealPlan';

const cx = Classy([]);

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

    return (<div className={cx('app')}>
      <header>

        <nav className={cx('navbar', 'navbar-expand-md', 'navbar-light', 'bg-light')}>
          <button className={cx('navbar-toggler')} type='button' aria-label='Toggle navigation' onClick={() => this.setState({collapsed: !collapsed})}>
            <span className={cx('navbar-toggler-icon')}></span>
          </button>

          <Link className={cx('navbar-brand')} to='/'>Open Kitchen</Link>

          <div className={cx('collapse', 'navbar-collapse', {show: collapsed})}>
            <ul className={cx('navbar-nav', 'mr-auto', 'mt-2', 'mt-md-0')}>
              <li className={cx('nav-item')}>
                <Link className={cx('nav-link')} to='/recipes'>Recipes</Link>
              </li>
              <li className={cx('nav-item')}>
                <Link className={cx('nav-link')} to='/groceryList'>Grocery List</Link>
              </li>
              <li className={cx('nav-item')}>
                <Link className={cx('nav-link')} to='/mealPlan'>Meal Plan</Link>
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
      <footer className={cx('container', 'text-center', 'py-3')}>
        <hr />
        <div className={cx('my-2')}><a href='#download' onClick={this.download}>Download File</a> &middot; <a href='#import' onClick={this.import}>Import From File</a> &middot; <Link to='/sync'>Sync To Device</Link></div>
        <input type='file' className={cx('d-none')} ref={this.importEl} accept='.ktcn,application/json' onChange={this.fileChange}/>
        <div>
          MIT &copy; 2019 Russell Steadman. Made with <span role='img' aria-label='Heart'>&#x2764;&#xFE0F;</span> for my mama.
        </div>
      </footer>
    </div>);
  };
}

export default App;
