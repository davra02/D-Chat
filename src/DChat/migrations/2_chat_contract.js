const fs = require('fs');
const SimpleChat = artifacts.require("SimpleChat");

module.exports = function(deployer) {
  deployer.deploy(SimpleChat).then(() => {
    // Guarda la dirección del contrato en un archivo
    fs.writeFileSync('contract-address.json', JSON.stringify({ contractAddress: SimpleChat.address }));
  });
};