import { trackEvent } from '@18f/identity-analytics';

class KeyPairGeneratorElement extends HTMLElement {
  connectedCallback() {
    this.logDuration();
  }

  async logDuration() {
    const duration = await this.generateKeyPairDuration();
    trackEvent('IdV: key pair generation', {
      duration: Math.round(duration),
      location: this.dataset.location,
    });
  }

  async generateKeyPairDuration() {
    const t0 = performance.now();

    const keypair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );
    const encodedPrivateKey = await crypto.subtle.exportKey('pkcs8', keypair.privateKey);
    this.privateB64key = btoa(String.fromCharCode.apply(null, new Uint8Array(encodedPrivateKey)));

    const encodedPublicKey = await crypto.subtle.exportKey('spki', keypair.publicKey);
    this.publicB64key = btoa(String.fromCharCode.apply(null, new Uint8Array(encodedPublicKey)));

    const t1 = performance.now();
    return t1 - t0; // milliseconds
  }
}

customElements.define('lg-key-pair-generator', KeyPairGeneratorElement);