import React from 'react';
import { Link } from 'react-router-dom';
import './GroceryList.scss';
import Store from '../shared/Store';
import Portal from '../shared/Portal';
import Classy from '../shared/Classy';

const cx = Classy([]);

let Quagga = null;

class GroceryList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            list: Store.get('list') || {},
            itemText: '',
            printing: false,
            scan: false
        };

        window.scrollTo(0, 0);

        if (/(android|iphone|ipod|ipad)/i.test(navigator.userAgent) && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
            this.importBarcode();
        }
    }

    importBarcode = async () => {
        await import('webrtc-adapter');

        Quagga = await import('quagga');
        Quagga = Quagga.default || Quagga;

        console.log(Quagga);

        alert('scan import');

        Quagga.onDetected((result) => {
            const code = result.codeResult.code;
    
            alert(code);

            Quagga.stop();
        });

        this.setState({scan: true});
    };

    scanBarcode = async () => {

        Quagga.init({
            inputStream : {
                type : 'LiveStream',
                constraints: {
                    width: {min: 640},
                    height: {min: 480},
                    facingMode: 'environment',
                    aspectRatio: {min: 1, max: 2}
                },
                singleChannel: true
            },
            locator: {
                patchSize: 'medium',
                halfSample: true
            },
            numOfWorkers: 2,
            decoder : {
              readers : ['upc_reader']
            }
        }, (err) => {
            alert(err.message);
            if (err) return console.error(err);
            console.log("Starting");
            Quagga.start();
        });
    };

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
        let { list, itemText, printing, scan } = this.state;

        return (<div className={cx('container')}>
            <h1 className={cx('my-3')}>Grocery List</h1>

            <Link to='/recipes' className={cx('btn-link')}>
                <div className={cx('btn', 'btn-outline-dark', 'btn-block', 'my-3')}>Add Recipe Ingredients</div>
            </Link>

            <ul className={cx('list-group', 'my-3', 'rounded-0')}>
                {Object.values(list).map(({name, id, checked}, key) => (<li key={key} className={cx('list-group-item', 'p-0', 'rounded-0')}>
                    <div className={cx('input-group')}>
                        <div className={cx('form-control', 'h-auto', 'border-0', 'rounded-0', 'list-text', {'text-strike': checked, 'bg-light': checked})} onClick={() => this.check(id)}>{name}</div>
                        <div className={cx('input-group-append')}>
                            <div className={cx('btn', 'btn-light', 'rounded-0')} onClick={() => this.removeItem(id)}>
                                <div>Remove</div>
                            </div>
                        </div>
                    </div>
                </li>))}
            </ul>

            <div className={cx('input-group')}>
                <input type='text' className={cx('form-control')} value={itemText} onChange={(ev) => {
                    this.setState({
                        itemText: ev.target.value
                    });
                }}/>
                <div className={cx('input-group-append')}>
                    <div className={cx('btn', 'btn-dark')} onClick={() => this.addItem(itemText)}>Add Item</div>
                </div>
            </div>

            {scan && (<div className={cx('btn', 'btn-dark', 'btn-block', 'my-2')} onClick={this.scanBarcode}>Scan Barcode</div>)}

            <div className={cx('btn', 'btn-outline-primary', 'btn-block', 'my-2')} onClick={this.print}>Print</div>

            <div className={cx('btn', 'btn-outline-danger', 'btn-block', 'my-2')} onClick={this.flushList}>Clear List</div>

            {printing && (<Portal root='print-root'>
                <h1>Grocery List</h1>
                <div className={cx('row', 'my-2')} style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Symbol", "Noto Color Emoji"'}}>
                    {Object.values(list).map(({name, id, checked}, key) => (<div key={key} className={cx('col-6')}>
                        <div className={cx('my-2')}>
                            {checked ? <strike>&#x2611; {name}</strike> : <span>&#x2610; {name}</span>}
                        </div>
                    </div>))}
                </div>

                <hr />
                <h3 className={cx('my-2')}>Menu Elements</h3>
                <ul className={cx('my-2')}>
                    {Object.values(list).reduce((a, b) => {
                        console.log(b.recipe, a);
                        if (b.recipe && a.indexOf(b.recipe) === -1) a.push(b.recipe);
                        return a;
                    }, []).map((id, key) => (<li key={key} className={cx('col-6')}>
                        {Store.get('recipes')[id].name}
                    </li>))}
                </ul>
                <div className={cx('d-block')}>
                    <hr/>
                    <small className={cx('text-center', 'text-muted', 'pt-3')}>Made by Open Kitchen. MIT &copy; 2019 Russell Steadman. Generated on {new Date().getMonth() + 1}/{new Date().getDate()}.</small>
                </div>
            </Portal>)}

            <div id='interactive' className='viewport'></div>
        </div>)
    };
}

export default GroceryList;
