import { DialogComponent } from '@theme/dialog';
import { CartAddEvent } from '@theme/events';
import { sectionRenderer } from '@theme/section-renderer';

/**
 * A custom element that manages a cart drawer.
 *
 * @extends {DialogComponent}
 */
class CartDrawerComponent extends DialogComponent {
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(CartAddEvent.eventName, this.#handleCartAdd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(CartAddEvent.eventName, this.#handleCartAdd);
  }

  /**
   * Handles cart add events
   * @param {CartAddEvent} event - The cart add event
   */
  #handleCartAdd = (event) => {
    // Force update the cart items component to ensure it shows the latest cart state
    const cartItemsComponent = /** @type {HTMLElement | null} */ (this.querySelector('cart-items-component'));
    if (cartItemsComponent?.dataset?.sectionId) {
      // Check if sections data is available in the event
      const cartItemsHtml = event.detail?.data?.sections?.[cartItemsComponent.dataset.sectionId];
      if (!cartItemsHtml) {
        // If no section HTML is provided, force a fresh render
        sectionRenderer.renderSection(cartItemsComponent.dataset.sectionId, { cache: false });
      }
    }
    
    if (this.hasAttribute('auto-open')) {
      this.showDialog();
    }
  };

  open() {
    this.showDialog();

    /**
     * Close cart drawer when installments CTA is clicked to avoid overlapping dialogs
     */
    customElements.whenDefined('shopify-payment-terms').then(() => {
      const installmentsContent = document.querySelector('shopify-payment-terms')?.shadowRoot;
      const cta = installmentsContent?.querySelector('#shopify-installments-cta');
      cta?.addEventListener('click', this.closeDialog, { once: true });
    });
  }

  close() {
    this.closeDialog();
  }
}

if (!customElements.get('cart-drawer-component')) {
  customElements.define('cart-drawer-component', CartDrawerComponent);
}
