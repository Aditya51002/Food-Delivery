let _io = null;

const init = (io) => {
  _io = io;
};

const get = () => _io;

module.exports = { init, get };
