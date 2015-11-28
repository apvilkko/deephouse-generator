function connectChain(chain) {
  for (let i = 0; i < chain.length - 1; ++i) {
    chain[i].connect(chain[i+1]);
  }
}
export default connectChain;
