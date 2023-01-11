import Head from "next/head";
import styles from "../styles/Home.module.css";
import web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  //Keep track of user's wallet is connected or not
  const [walletConnected, setwalletConnected] = useState(false);
  //tracks current metamask address has joined whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  //loading is set to true when we are waiting for a txn to get mined
  const [loading, setLoading] = useState(false);
  //tracks numberOfWhitelisted address's
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  //create a reference to the web3 modal (used for connecting to metamask) which persists while page is open
  const web3ModalRef = useRef();

  /**
   * Returns a provider or signer object representing the ethereum RPC with or without
   * signing capabilities of metamask attched.
   *
   * A `Provider` is needed to interact with the blockchain - reading txns, balances, states, etc.
   *
   * A `Signer` is a special type of provider used in case a write txn needs to be made to the blockchain, which involves the connected account
   * needing to make  a digital signature to authorize the txn being sent. Metamask exposes a signer API to allow your website to
   * request signatures from the user using signer funcitons.
   *
   * @param {*} needSigner - true of you need the signer, default false
   */

  const getProviderOrSigner = async (needSigner = false) => {
    //Connect to metamask
    //since we store `web3modal` as a ref, we need to access the current value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new provider.web3Provider(provider);

    //If user is not connected to Goreli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
      //we need a signer here since this is a write txn
      const signer = await getProviderOrSigner(true);
      //Create a new instance of the contract with a signer, which allows update methods
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      //call the addAddressToWhitelist from the constract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      //wait for the txn to get mined
      await tx.wait();
      setLoading(false);
      //get the updated number of addr in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getNumberOfWhitelisted: gets the number of whitelisted addresses
   */
  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      //we connect to the contract using a provider, so we will only
      // have read-only access to the contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      //call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInWhitelist: checks if the address is in whitleist
   */
  const checkIfAddressInWhitelist = async () => {
    try {
      //we will need the signer later to get the user's addr
      //Even though it is a read txn, since signers are just special kinds of Providers,
      // We can use it in it's place
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      //Get the addr associated to the signer which is connected to MM(metamask)
      const address = await signer.getAddress();
      //call the whitelistedAddress from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };
  /* 
    connectWallet: connects the metamask wallet
   */
  const connectWallet = async () => {
    try {
      //Get the provider from web3modal, which in our case is Metamask
      //WHen used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setwalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };
  /*
renderButton: return a button based on the state of the dApp
*/
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the whitelist
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    //if wallet is not connected, create a new instance of web3modaland and connect metamask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to crypti Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have alreday joined the whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Mahee</footer>
    </div>
  );
}
