export default (image, ddgProxy) => {
    let photoURL = encodeURIComponent(Array.isArray(image)
    ? (typeof image[0] === 'object'
        ? image[0].url
        : image[0])
    : typeof image === 'object'
        ? image.url
        : image);
    
    if (ddgProxy) return `https://proxy.duckduckgo.com/iu/?u=${photoURL}&f=1`;

    return `${process.env.NODE_ENV === 'development' ? process.env.REACT_APP_SERVER_ORIGIN : ''}/api/photoProxy?url=${photoURL}`;
};