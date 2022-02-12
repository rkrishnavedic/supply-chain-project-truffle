import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, cost: 0, itemName: "example_1" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      
      this.itemManager = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      );

      this.item = new this.web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[this.networkId] && ItemContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToPaymentEvent();
      this.setState({ loaded:true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  listenToPaymentEvent = ()=>{
    let self = this;
    this.itemManager.events.SupplyChainStep().on("data", async function(_event){
      console.log(_event);
      let itemObj = await self.itemManager.methods.items(_event.returnValues._itemIndex).call();
      alert("Item "+itemObj._identifier+" was paid, deliver now!");
      console.log(itemObj);
    })
  }

  handleInputChange = (event)=>{
    const {value, name} = event.target;
    this.setState({
      [name]:value
    })
  }

  handleSubmit = async()=>{
    const {cost, itemName} = this.state;
    const response = await this.itemManager.methods.createItem(itemName, cost).send({from: this.accounts[0]})
    console.log(response);
    alert("Send Wei: "+cost+ " to "+ response.events.SupplyChainStep.returnValues._itemAddress)
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Supply Chain Project!</h1>
        <p>Items </p>
        <h2>Add Items</h2>
        <p>
          <div>
            Cost in Wei: <input type="text" name="cost" value={this.state.cost} onChange={this.handleInputChange}/>
            Item Identifier: <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange}/>
            <button type="button" onClick={this.handleSubmit}>Creat New Item</button>
          </div>
        </p>
        <p>
          Try changing the value stored on <strong>line 42</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}

export default App;
