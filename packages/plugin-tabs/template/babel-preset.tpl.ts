export default ()=>{
  return {
    plugins: [
      require('react-activation/babel'),
      require("../src/babel"),
    ],
  }
}
