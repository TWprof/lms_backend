const generateResetPin = () => {
  const minm = 100000;
  const maxm = 999999;

  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  // const pin = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  // const duration = 300000;
  // const expiresAt = new Date(Date.now() + duration);
  // return {
  //   pin: pin,
  //   expiresAt: expiresAt,
  // };
};

module.exports = generateResetPin;
