import React from 'react';
import io from 'socket.io-client';
import Store from '../shared/Store';

const socket = io(process.env.NODE_ENV === 'development' ? process.env.REACT_APP_SOCKET_URL : undefined, {
    autoConnect: false
});

class SyncFrom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.match.params.id
        };

        window.scrollTo(0, 0);
    }

    componentDidMount() {
        socket.open();
        socket.on('connect', () => {
            socket.emit('syncRequest', this.state.id);
        });
        socket.on('syncData', (msg) => {
            console.log(msg);
            for (let i in msg) {
                Store.set(i, msg[i]);
            }
            this.props.history.push('/');
        });
    }

    componentWillUnmount() {
        socket.close();
    }

    render() {
        return (<div className='container'>
            <h1 className='pt-3 pb-2'>Syncing...</h1>
            <div className='alert alert-info my-3'>
                Just one second...
            </div>
        </div>)
    };
}

export default SyncFrom;
