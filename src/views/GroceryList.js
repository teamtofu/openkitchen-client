import React from 'react';
import { Link } from 'react-router-dom';
import './GroceryList.scss';
import Store from './../shared/Store';
import Portal from './../shared/Portal';

class GroceryList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            list: Store.get('list') || {},
            itemText: '',
            printing: false
        };

        window.scrollTo(0, 0);
    }

    addItem = (name) => {
        let list = Store.get('list') || {};
        let item = {
            name,
            createdAt: new Date().getTime(),
            id: Math.random().toString(36).split('.')[1],
            checked: false
        };
        list[item.id] = item;
        Store.set('list', list);
        this.setState({
            list,
            itemText: ''
        });
    };

    removeItem = (id) => {
        let list = Store.get('list') || {};
        delete list[id];
        Store.set('list', list);
        this.setState({
            list
        });
    };

    check = (id) => {
        let list = Store.get('list') || {};
        list[id].checked = !list[id].checked;
        Store.set('list', list);
        this.setState({
            list
        });
    };

    flushList = () => {
        Store.set('list', {});
        this.setState({
            list: {}
        });
    };

    print = async () => {
        await new Promise((res, rej) => {
            this.setState({printing: true}, () => {
                res();
            });
        });
        const root = document.getElementById('root');
        root.setAttribute('style', 'display: none !important; opacity: 0 !important;');
        window.print();
        root.removeAttribute('style');
        this.setState({printing: false});
    }

    render() {
        let { list, itemText, printing } = this.state;

        return (<div className='container'>
            <h1 className='my-3'>Grocery List</h1>

            <Link to='/recipes' className='btn-link'>
                <div className='btn btn-outline-dark btn-block my-3'>Add Recipe Ingredients</div>
            </Link>

            <ul className='list-group my-3 rounded-0'>
                {Object.values(list).map(({name, id, checked}, key) => (<li key={key} className='list-group-item p-0 rounded-0'>
                    <div className='input-group'>
                        <div className={'form-control h-auto border-0 rounded-0 list-text' + (checked ? ' text-strike bg-light' : '')} onClick={() => this.check(id)}>{name}</div>
                        <div className='input-group-append'>
                            <div className='btn btn-light rounded-0' onClick={() => this.removeItem(id)}>
                                <div>Remove</div>
                            </div>
                        </div>
                    </div>
                </li>))}
            </ul>

            <div className='input-group'>
                <input type='text' className='form-control' value={itemText} onChange={(ev) => {
                    this.setState({
                        itemText: ev.target.value
                    });
                }}/>
                <div className='input-group-append'>
                    <div className='btn btn-dark' onClick={() => this.addItem(itemText)}>Add Item</div>
                </div>
            </div>

            <div className='btn btn-outline-primary btn-block my-2' onClick={this.print}>Print</div>

            <div className='btn btn-outline-danger btn-block my-2' onClick={this.flushList}>Clear List</div>

            {printing && (<Portal root='print-root'>
                <h1>Grocery List</h1>
                <div className='row my-2' style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Symbol", "Noto Color Emoji"'}}>
                    {Object.values(list).map(({name, id, checked}, key) => (<div key={key} className='col-6'>
                        <div className='my-2'>
                            {checked ? <strike>&#x2611; {name}</strike> : <span>&#x2610; {name}</span>}
                        </div>
                    </div>))}
                </div>

                <hr />
                <h3 className='my-2'>Menu Elements</h3>
                <ul className='my-2'>
                    {Object.values(list).reduce((a, b) => {
                        console.log(b.recipe, a);
                        if (b.recipe && a.indexOf(b.recipe) === -1) a.push(b.recipe);
                        return a;
                    }, []).map((id, key) => (<li key={key} className='col-6'>
                        {Store.get('recipes')[id].name}
                    </li>))}
                </ul>
                <div className='d-block'>
                    <hr/>
                    <small className='text-center text-muted pt-3'>Made by Open Kitchen. MIT &copy; 2019 Russell Steadman. Generated on {new Date().getMonth() + 1}/{new Date().getDate()}.</small>
                </div>
            </Portal>)}
        </div>)
    };
}

export default GroceryList;
