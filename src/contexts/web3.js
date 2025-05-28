import { ethers } from "ethers";

let provider;

export async function attatchWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            return { provider, signer, address };
        } catch (error) {
        console.error("User denied account access", error);
        throw new Error("User denied account access");
        return null;
        }
    } else {
        console.error("No Ethereum provider found");
        throw new Error("No Ethereum provider found");
    }
}

export async function removeWallet() {
    provider = null;
    return { provider: null, signer: null, address: null };
}