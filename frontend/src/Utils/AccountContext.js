import { ethers } from 'ethers';

export function createCustomWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
  };
}
export async function storePublicAddress(email, data) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_PORT_URL}/api/store-address`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...data }),
      }
    );
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();
    return result; // Return the full response object
  } catch (error) {
    console.error('Error storing public address:', error);
    return { success: false, error: error.message };
  }
}
function loginWithMnemonic(mnemonic) {
  try {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet.address;
  } catch (error) {
    console.error('Invalid mnemonic:', error);
    return null;
  }
}

// // When creating a new account (custom wallet + MetaMask)
// const wallet = createCustomWallet();
// const response = await storePublicAddress(formData.email, {
//   public: wallet.address,
//   MetaMask: address, // MetaMask address from web3
// });
