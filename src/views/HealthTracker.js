import React from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import Store from '../shared/Store';
import Fuse from 'fuse.js';
import GetImage from '../shared/GetImage';
import ImportIng from '../shared/ImportIng';
import Classy from '../shared/Classy';
import Cropper from '../shared/Cropper';
import 'cropperjs/dist/cropper.css';

/*const image = document.createElement('img');
image.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=60';

Tess.recognize(image)
  .progress((p) => { console.log('progress', p);    })
  .then((result) => { console.log('result', result); });*/

//Tess.options.corePath = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@2.0.0-beta.10/tesseract-core.wasm.js';
//Tess.options.workerPath = 'https://cdn.jsdelivr.net/npm/tesseract.js@2.0.0-alpha.10/dist/worker.min.js';

//console.log(typeof new Tesseract.TesseractWorker().setLangPath);

//Tesseract.workerOptions.langPath = '/ocr-lang/3.04/';

//Tesseract.workerOptions.langPath = 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/3.02/';

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
            search: '',
            scan: !!window.Tesseract,
            step: 0,
            imageUrl: '',
            scanText: '',
            scanStatus: '',
            scanProgress: 0,
            fileName: ''
        };

        window.scrollTo(0, 0);

        if (/(android|iphone|ipod|ipad)/i.test(navigator.userAgent)) {
            this.importScan();
        }

        this.scanFile = React.createRef();
    }

    importScan = async () => {
        if (!window.Tesseract) {
            let Tesseract = await import('tesseract.js');
            Tesseract = Tesseract || Tesseract.default;
            window.Tesseract = Tesseract.create({
                workerPath: window.location.origin + '/tess/worker-1.0.19.js',
                langPath: window.location.origin + '/tess/lang-3.02/',
                corePath: window.location.origin + '/tess/core-0.1.0.js',
            });
            this.setState({scan: true});
        }
    };

    componentWillMount() {
        socket.open();
        socket.on('healthTagProcessed', (msg) => {
            console.log(msg.length);

            this.runOCR('data:image/jpeg;base64,' + btoa(msg));
        });
    }

    componentWillUnmount() {
        socket.close();
    }

    /*fetch = () => {
        if (!this.state.url) return;
        socket.emit('recipeUrl', this.state.url);
        this.setState({url: ''});
    };*/

    scanLabel = async () => {
        console.log('step 1');
        if (!this.scanFile.current.files[0]) return;
        console.log('scanning label');
        let reader = new FileReader();
        reader.onload = async (ev) => {
            let text = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN}/api/image`, {
                method: 'POST',
                body: ev.target.result,
                headers: {
                    'Content-Type': 'text/plain'
                }
            }).then((a) => (a.text()));
            console.log(text);
        };
        reader.readAsBinaryString(this.scanFile.current.files[0]);
    }

    readFile = async () => {
        if (!this.scanFile.current.files[0]) return;
        let reader = new FileReader();
        reader.onload = async (ev) => {
            this.setState({
                imageUrl: ev.target.result,
                step: 1
            });
        };
        reader.readAsDataURL(this.scanFile.current.files[0]);
    };

    runOCR = async (image) => {
        const statusMap = {
            'loading tesseract core': 'Loading label reader...',
            'initializing tesseract': 'Initializing label reader...',
            'downloading eng.traineddata.gz': 'Downloading necessary files...',
            'unzipping eng.traineddata.gz': 'Unzipping files...',
            'loading eng.traineddata': 'Loading files into label reader...',
            'initializing api': 'Starting up label reader...',
            'recognizing text': 'Recognizing label...',
        };
        let {text} = await window.Tesseract
            .recognize(image)
            .progress(({status, progress}) => {
                console.log(status);
                if (status) this.setState({
                    scanStatus: statusMap[status] || 'Working...',
                    scanProgress: progress
                });
            });
        console.log('text', text);
        this.setState({scanText: text});
    };

    cropImage = () => {
        const cropper = this.refs.cropper;

        let reader = new FileReader();
        reader.onload = async (ev) => {
            let text = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN}/api/image`, {
                method: 'POST',
                body: ev.target.result,
                headers: {
                    'Content-Type': 'text/plain'
                }
            }).then((a) => (a.text()));
        };
        cropper.getCroppedCanvas().toBlob((blob) => {
            reader.readAsBinaryString(blob);
        }, 'image/jpeg', .95);
        //getCroppedCanvas
    };

    render() {
        let { scan, scanText, scanStatus, scanProgress, fileName, imageUrl, step } = this.state;

        return (<div className={cx('container')}>
            <h1 className={cx('pt-3', 'pb-2')}>My Health Tracker</h1>
            {scan && (<div>
                <input type='file' className={cx('d-none')} /*onChange={({target}) => (target.files[0] && this.setState({fileName: target.files[0].name}))}*/ onChange={this.readFile} accept='image/jpeg,image/png,.jpg,.png' ref={this.scanFile}/>

                {step === 0 && (<div className={cx('form-control')} onClick={() => this.scanFile.current.click()}>
                    {fileName ? `File Selected: ${fileName}`  : 'Select a File'}
                </div>)}

                {step === 1 && (<Cropper
                    ref='cropper'
                    crossOrigin='false'
                    src={imageUrl}
                    style={{width: '100%', height: 400}}
                    guides={true}
                    rotatable={true}
                    saveImage={(image) => {console.log(image)}}
                    responseType='blob'
                        />)}

                {step !== 0 && (<div className={cx('btn', 'btn-dark')} onClick={this.cropImage}>Crop &amp; Analyze</div>)}

                {scanStatus && (<div className={cx('alert', 'alert-info')}>
                    <div>{scanStatus}</div>
                    <div className={cx('progress')}>
                        <div className={cx('progress-bar', 'progress-bar-striped', 'bg-info')} role='progressbar' style={{width: `${scanProgress * 100}%`}} aria-valuenow={scanProgress * 100} aria-valuemin='0' aria-valuemax='100'></div>
                    </div>
                </div>)}
                {scanText}
            </div>)}
        </div>)
    };
}

export default Recipes;
