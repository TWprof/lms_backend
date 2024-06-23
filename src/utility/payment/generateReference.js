const generateReference = () => {
  let prefix = "TWP_TF";
  const minm = 10000000000;
  const maxm = 99999999999;

  const genereatedRandom = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  return prefix + genereatedRandom;
};

module.exports = generateReference;
