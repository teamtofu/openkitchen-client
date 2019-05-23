import React from 'react';
import io from 'socket.io-client';
import Store from '../shared/Store';
import QRCode from 'qrious';
import Classy from '../shared/Classy';

const cx = Classy([]);

const socket = io(process.env.NODE_ENV === 'development' ? process.env.REACT_APP_SOCKET_URL : undefined, {
    autoConnect: false
});

class Sync extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            code: 'about:blank',
            id: ''
        };

        window.scrollTo(0, 0);
    }

    componentWillMount() {
        socket.open();
        socket.on('connect', () => {
            console.log(socket.id);
            this.setId(socket.id);
        });
        socket.on('syncRequest', (req) => {
            console.log(req);
            socket.emit('syncData', req, {
                recipes: Store.get('recipes'),
                list: Store.get('list'),
                plan: Store.get('plan')
            });
        });
    }

    componentWillUnmount() {
        socket.close();
    }

    setId = (id) => {
        const qr = new QRCode({
            element: document.createElement('canvas'),
            value: `${window.location.origin}/sync/${id}`,
            background: 'white',
            foreground: 'black',
            backgroundAlpha: 1,
            foregroundAlpha: 1,
            level: 'M',
            mime: 'image/png',
            size: 192
        });
        this.setState({
            code: qr.toDataURL(),
            id
        });
    };

    render() {
        let { code, id } = this.state;

        return (<div className={cx('container')}>
            <h1 className={cx('pt-3', 'pb-2')}>Sync</h1>
            <img src={code} alt='QR Code' height={192} width={192} style={{color: 'transparent', width: '192px', height: '192px'}} className={cx('mx-auto', 'text-center', 'd-block')}/>
            <div className={cx('form-control', 'my-2')}>
                {window.location.origin}/sync/{id}
            </div>
            <div className={cx('alert', 'alert-info', 'my-3')}>
                Open the link or scan the QR Code on the other device to sync data from this device.
            </div>
        </div>)
    };
}

export default Sync;
